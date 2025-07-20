const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { SupportChat, Settings } = require("../database");
const downloadImage = require("../helpers/downloadImageTelegram");

const fs = require("fs");
const axios = require("axios");

const logMessage = async (ctx, message, photoUrl = null) => {
  try {
    const settings = await Settings.findByPk(1);
    const userName = ctx.from.username ? `@${ctx.from.username}` : `[ID: ${ctx.from.id}]`;

    if (photoUrl) {
      // Скачиваем изображение
      const response = await axios.get(photoUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      await ctx.telegram.sendPhoto(settings.loggingGroupId, { source: buffer }, {
        caption: `${userName} - ${message}`,
        parse_mode: "HTML",
      });
    } else {
      await ctx.telegram.sendMessage(settings.loggingGroupId, `${userName} - ${message}`, {
        parse_mode: "HTML",
      });
    }
  } catch (err) {
    console.error("Ошибка при логировании сообщения:", err);
  }
};

const scene = new WizardScene(
  "support_send_message",
  async (ctx) => {
    try {
      if (ctx.updateType == "callback_query")
        await ctx.answerCbQuery().catch((err) => err);
      ctx.updateType = "message";
    await ctx.scene.reply(`Введите сообщение. Можно использовать <b>HTML-теги</b>.
        
<b>Важно:</b> <i>обязательно закрывайте все HTML-теги, иначе форматирование не сработает!</i>
`, {
          
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });   

      logMessage(ctx, "Шаг 1: <b>Пользователь начал отправку сообщения.</b>");
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      let logContent;
      let supportMessage;

      if (ctx.message?.photo?.length > 1) {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const link = await downloadImage(fileId);
      
        if (!link) {
          console.error("Ошибка: downloadImage не вернул ссылку.");
          ctx.reply("❌ Ошибка при загрузке изображения").catch((err) => err);
          return ctx.scene.leave();
        }
      
        supportMessage =   await SupportChat.create({
          messageFrom: 0,
          supportId: ctx.scene.state.supportId,
          message: link,
          messageId: ctx.message.message_id,
        });
      
        await ctx.scene.reply("<b>✅ Изображение отправлено!</b>", {
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
      
        logMessage(ctx, "Шаг 2: <b>Изображение отправлено</b>", link); // Только один вызов!
      } else if (ctx.message?.text) {
        const escapedText = ctx.message.text;
      
        supportMessage =    await SupportChat.create({
          messageFrom: 0,
          supportId: ctx.scene.state.supportId,
          message: escapedText,
          messageId: ctx.message.message_id,
        });
      
        await ctx.scene.reply("<b>✅ Сообщение отправлено!</b>", {
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
      
        logMessage(ctx, `Шаг 2: Текст: <b>${escapedText}</b>`); // Только один вызов!
      }
      
       else {
        return ctx.wizard.prevStep();
      }

      // logMessage(ctx, `Шаг 2: ${logContent}`);
    } catch (err) {
      console.log(err);
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave(ctx => {
  if (ctx.updateType === "callback_query") {
    ctx.deleteMessage().catch(err => err);
  }
});

// Обработчик кнопки "🗑 Удалить сообщение"

module.exports = scene;
