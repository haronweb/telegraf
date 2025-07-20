const { Markup } = require("telegraf");
const { User } = require("../database");

module.exports = async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    let buttonText = user && user.media ? "✏️ Изменить медиа" : "📎 Установить медиа";
    let buttons = [
      [Markup.callbackButton(buttonText, "start_set_profit_media")],
      user && user.media ? [Markup.callbackButton("🗑 Удалить медиа", "delete_profit_media")] : [],
      [Markup.callbackButton("◀️ Назад", "settings_media")]
    ].filter(row => row.length > 0);

    await ctx.deleteMessage().catch((err) => console.error("Ошибка удаления сообщения:", err));

    if (user && user.media) {
      switch (user.media_type) {
        case "photo":
          await ctx.replyWithPhoto(user.media, {
            caption: `<b>🌆 Ваше текущее изображение профита</b>`,
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons),
          });
          break;
        case "video":
          await ctx.replyWithVideo(user.media, {
            caption: `<b>🎥 Ваше текущее видео профита</b>`,
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons),
          });
          break;
        case "animation":
          await ctx.replyWithAnimation(user.media, {
            caption: `<b>🎞 Ваш текущий GIF профита</b>`,
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons),
          });
          break;
        case "sticker":
          await ctx.replyWithSticker(user.media);
          await ctx.reply("🖼 Ваш текущий стикер профита", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons),
          });
          break;
        case "document":
          await ctx.replyWithDocument(user.media, {
            caption: `<b>📄 Ваш текущий документ профита</b>`,
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons),
          });
          break;
        default:
          await ctx.reply("❌ Неподдерживаемый тип медиа.");
      }
    } else {
      await ctx.reply(
        `<b>❌ У вас ещё не установлено медиа для профита</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard(buttons),
        }
      );
    }
  } catch (err) {
    console.error("Ошибка при обработке медиа профита:", err);
    await ctx.reply("❌ Ошибка при загрузке медиа").catch((err) => console.error("Ошибка отправки сообщения:", err));
  }
};
