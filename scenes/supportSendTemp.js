const { User, Support, SupportChat, SupportTemp } = require("../database");
const WizardScene = require("telegraf/scenes/wizard");

const scene = new WizardScene("support_sendTemp", async (ctx) => {
  try {
    if (ctx.updateType === "callback_query") await ctx.answerCbQuery().catch(() => {});
    ctx.updateType = "message";

    const { supportId, userId, tempId } = ctx.scene.state;
    if (!supportId || !userId || !tempId) {
      return ctx.reply("❌ Ошибка: Некорректные данные.").catch(() => {});
    }

    const temp = await SupportTemp.findOne({ where: { id: tempId } });
    if (!temp) return ctx.reply("❌ Ошибка: Шаблон не найден.").catch(() => {});

    const support = await Support.findOne({
      where: { id: supportId },
      include: [{ association: "ad", required: true }],
    });

    if (!support)
    {
      await ctx.reply("❌ Ошибка: Поддержка не найдена.").catch(() => {});
  return ctx.scene.leave(); // 💥 обязательно выйти из сцены

    }
    
    const ad = support.ad;

    // 🔄 Замена переменных
    const replaceAutoPlaceholders = (text, ad) => {
      const map = {
        "{title}": ad.title || "",
        "{price}": ad.price || "",
        "{address}": ad.address || "",
        "{id}": ad.id || "",
        "{name}": ad.name || "",
      };
      let result = text;
      for (const [key, value] of Object.entries(map)) {
        result = result.replaceAll(key, String(value));
      }
      return result;
    };

    const replacedText = temp.text ? replaceAutoPlaceholders(temp.text, ad) : temp.photo;

    // ✅ Уведомление
    const confirmMessageText = `<b>✅ Шаблон "${temp.title}" успешно отправлен!</b>`;
    let sentMessage;
    if (temp.photo) {
      sentMessage = await ctx.replyWithPhoto(temp.photo, {
        caption: confirmMessageText,
        parse_mode: "HTML",
      });
    } else {
      sentMessage = await ctx.reply(confirmMessageText, {
        parse_mode: "HTML",
      });
    }

    const chatId = await SupportChat.create({
      supportId,
      messageFrom: 0,
      message: replacedText,
      messageId: sentMessage.message_id,
      confirmMessageId: sentMessage.message_id,
      fromOperator: ctx.from.id !== userId,
      isTemplate: true,
    });

    // 💬 Уведомление воркеру
    const worker = await User.findOne({ where: { id: userId } });
    if (worker && worker.operator && ctx.from.id !== userId) {
      const notifyMessage = await ctx.telegram.sendMessage(
        userId,
        `👨🏼‍💻 Оператор <b>@${ctx.from.username}</b> отправил мамонту шаблон.`,
        { parse_mode: "HTML" }
      );

      await SupportChat.update(
        { notifyMessageId: notifyMessage.message_id },
        { where: { id: chatId.id } }
      );
    }
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Ошибка");
  }

  return ctx.scene.leave();
});

scene.leave((ctx) =>
  ctx.updateType === "callback_query" && ctx.deleteMessage().catch(() => {})
);

module.exports = scene;
