const { Markup, Telegram } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Operators } = require("../database");

const bot = new Telegram(process.env.BOT_TOKEN);

const scene = new WizardScene(
  "callLogScene",

  async (ctx) => {
    try {
      const { adId, clickedUserId } = ctx.scene.state;
      ctx.scene.state.adId = adId;
      ctx.scene.state.clickedUserId = clickedUserId;
      ctx.scene.state.data = {};

      await ctx.scene.reply("Введите номер мамонта", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.scene.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      if (!ctx.message?.text) return;
      ctx.scene.state.data.phone = ctx.message.text.trim();

      await ctx.scene.reply("Введите комментарий по прозвону", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.scene.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      if (!ctx.message?.text) return;

      const { adId, clickedUserId } = ctx.scene.state;
      const ad = await Ad.findOne({
        where: { id: adId },
        include: ["user", "service"],
      });

      if (!ad) {
        await ctx.scene.reply("❌ Объявление не найдено");
        return ctx.scene.leave();
      }

      const comment = ctx.message.text.trim();
    const phone = ctx.scene.state.data.phone;
    const serviceTitle = ad.service.title;
    const adTitle = ad.title;
    const price = ad.price || "null";
    const operatorId = ad.user.operator;
    const senderId = clickedUserId || ctx.from.id;
    const senderUsername = ctx.from.username ? `@${ctx.from.username}` : ctx.from.id;

    let senderRole = "Пользователь";
    let isSenderWorker = senderId === ad.userId;
    let isSenderOperator = false;

    if (isSenderWorker) {
      senderRole = "Воркер";
    } else {
      const op = await Operators.findOne({ where: { userId: senderId } });
      if (op) {
        senderRole = "Оператор";
        isSenderOperator = true;
      }
    }



      const logMessage = `📞 Поступила заявка на прозвон!

📦 Сервис: <b>${serviceTitle}</b>
🏷 Название: <b>${adTitle}</b> (#${ad.id})
💰 Цена: <b>${price}</b>
📱 Номер: <b>${phone}</b>

👤 ${senderRole}: <b>${senderUsername}</b>
💬 Комментарий: <b>${comment}</b>`;

      const inlineKeyboard = Markup.inlineKeyboard([
        [
          Markup.callbackButton("✅ Принять прозвон", `call_accept_${ad.id}`),
          Markup.callbackButton("❌ Отклонить прозвон", `call_decline_${ad.id}`),
        ],
      ]);

      await bot.sendMessage(-1002733827297, logMessage, {
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
      });

const notifyMessage = `📞 <b>${senderUsername}</b> (${senderRole.toLowerCase()}) отправил заявку на прозвон по объявлению #id${ad.id}\n\n📱 <code>${phone}</code>\n💬 ${comment}`;

    // Заявка успешно отправлена отправителю
    await ctx.telegram.sendMessage(
      senderId,
      `📞 Заявка на прозвон по объявлению #id${ad.id} успешно отправлена!\n\n📱 <code>${phone}</code>\n💬 ${comment}`,
      { parse_mode: "HTML" }
    );

    // Уведомление воркеру, если отправил не он
    if (ad.userId && senderId !== ad.userId) {
      await ctx.telegram.sendMessage(
        ad.userId,
        notifyMessage,
        { parse_mode: "HTML" }
      );
    }

  // Уведомление оператору, если он есть и не является отправителем
if (operatorId && Number(operatorId) !== Number(senderId)) {
  await ctx.telegram.sendMessage(
    operatorId,
    notifyMessage,
    { parse_mode: "HTML" }
  );
}


    return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.scene.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
