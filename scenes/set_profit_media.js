const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { User } = require("../database");
const log = require("../helpers/log");
const photo = require("../commands/media_profit");

const scene = new WizardScene(
  "set_profit_media",
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch((err) => err);

      const instructionMessage = await ctx.reply("📎 Отправьте медиафайл (фото, видео или GIF)", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });

      // Сохраняем ID сообщения с инструкцией
      ctx.wizard.state.instructionMessageId = instructionMessage.message_id;

      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Произошла ошибка.").catch(() => null);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const message = ctx.message;

      let mediaType = null;
      let fileId = null;

      if (message.photo) {
        mediaType = "photo";
        fileId = message.photo[message.photo.length - 1].file_id;
      } else if (message.video) {
        mediaType = "video";
        fileId = message.video.file_id;
      } else if (message.animation) {
        mediaType = "animation";
        fileId = message.animation.file_id;
      } else {
        await ctx.scene.reply("❌ Неподдерживаемый тип медиа. Пожалуйста, отправьте фото, видео или GIF.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
        return ctx.wizard.selectStep(ctx.wizard.cursor);
      }

      await User.update(
        { media: fileId, media_type: mediaType },
        { where: { id: ctx.from.id } }
      );

      log(ctx, `Добавлено медиа к профиту: ${mediaType}`);

      // Удаляем сообщение с инструкцией, если оно было сохранено
      if (ctx.wizard.state.instructionMessageId) {
        await ctx.deleteMessage(ctx.wizard.state.instructionMessageId).catch(() => null);
      }

      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при сохранении медиафайла.").catch(() => null);
      return ctx.scene.leave();
    }
  }
);

scene.leave(photo);
module.exports = scene;
