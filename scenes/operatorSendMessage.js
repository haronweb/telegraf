const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { SupportChat, User, Settings } = require("../database");
const downloadImage = require("../helpers/downloadImageTelegram");
const axios = require("axios");

const logMessage = async (ctx, message, photoUrl = null, adId = null) => {
  try {
    const settings = await Settings.findByPk(1);
    const userName = ctx.from.username ? `@${ctx.from.username}` : `[ID: ${ctx.from.id}]`;
    const adInfo = adId ? `<b>🔍 #id${adId}</b>` : "";

    if (photoUrl) {
      const response = await axios.get(photoUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      await ctx.telegram.sendPhoto(settings.loggingGroupId, { source: buffer }, {
        caption: `${userName} - ${message}\n\n${adInfo}`,
        parse_mode: "HTML",
      });
    } else {
      await ctx.telegram.sendMessage(settings.loggingGroupId, `${userName} - ${message}\n\n${adInfo}`, {
        parse_mode: "HTML",
      });
    }
  } catch (err) {
    console.error("Ошибка при логировании сообщения:", err);
  }
};

const scene = new WizardScene(
  "operator_send_message",
  async ctx => {
    try {
      if (ctx.updateType === "callback_query") await ctx.answerCbQuery().catch(() => {});
      ctx.updateType = "message";

     await ctx.scene.reply(`Введите сообщение. Можно использовать <b>HTML-теги</b>.
        
<b>Важно:</b> <i>обязательно закрывайте все HTML-теги, иначе форматирование не сработает!</i>
`, {
          
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });   

      await logMessage(ctx, "Шаг 1: <b>Оператор начал отправку сообщения.</b>", null, ctx.scene.state.adId);

      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },
  async ctx => {
    try {
      let supportMessage;
      const userId = ctx.scene.state.userId;
      const supportId = ctx.scene.state.supportId;

      // === Фото ===
      if (ctx.message?.photo?.length > 1) {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const link = await downloadImage(fileId);

        if (!link) {
          await ctx.reply("❌ Ошибка при загрузке изображения").catch(() => {});
          return ctx.scene.leave();
        }

        supportMessage = await SupportChat.create({
          messageFrom: 0,
          supportId,
          message: link,
          messageId: ctx.message.message_id,
          confirmMessageId: ctx.message.message_id,
          fromOperator: true,
          isTemplate: false,
        });

        await ctx.scene.reply("✅ Изображение отправлено!", {
          parse_mode: "HTML",
          reply_to_message_id: ctx.message.message_id,
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✏️ Редактировать",
                `edit_support_message_${supportMessage.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "❌ Удалить",
                `delete_support_message_${supportMessage.id}`
              ),
            ],
          ]),
        }).catch(() => { });

        await logMessage(ctx, "Изображение отправлено!", link, ctx.scene.state.adId);

        const notifyMessage = await ctx.telegram.sendMessage(
          userId,
          `👨🏼‍💻 Оператор <b>@${ctx.from.username}</b> отправил изображение.`,
          { parse_mode: "HTML" }
        );

        await SupportChat.update(
          { notifyMessageId: notifyMessage.message_id },
          { where: { id: supportMessage.id } }
        );

      // === Текст ===
      } else if (ctx.message?.text) {
        const escapedText = ctx.message.text;

        supportMessage = await SupportChat.create({
          messageFrom: 0,
          supportId,
          message: escapedText,
          messageId: ctx.message.message_id,
          confirmMessageId: ctx.message.message_id,
          fromOperator: true,
          isTemplate: false,
        });

        const notifyMessage = await ctx.telegram.sendMessage(
          userId,
          `👨🏼‍💻 Оператор <b>@${ctx.from.username}</b> ответил мамонту.`,
          { parse_mode: "HTML" }
        );

        await SupportChat.update(
          { notifyMessageId: notifyMessage.message_id },
          { where: { id: supportMessage.id } }
        );

        await ctx.scene.reply("✅ Сообщение отправлено!", {
          parse_mode: "HTML",
          reply_to_message_id: ctx.message.message_id,
        reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✏️ Редактировать",
                `edit_support_message_${supportMessage.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "❌ Удалить",
                `delete_support_message_${supportMessage.id}`
              ),
            ],
          ]),
        }).catch(() => { });

        await logMessage(ctx, `Текст: <b>${escapedText}</b>`, null, ctx.scene.state.adId);
      } else {
        return ctx.wizard.prevStep();
      }
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
    }
    return ctx.scene.leave();
  }
);

scene.leave(ctx => {
  if (ctx.updateType === "callback_query") {
    ctx.deleteMessage().catch(() => {});
  }
});

module.exports = scene;