const { Markup } = require("telegraf");
const { User } = require("../database");

module.exports = async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    await ctx.answerCbQuery("Загружаю информацию.. ").catch((err) => err);
    // await ctx.deleteMessage().catch((err) => err);

    return ctx
      .replyOrEdit(`
🏷️ Ваш TAG: <b>${user.tag ==null ? "Не установлен": `#${user.tag}`}</b>`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("✍️ Установить свой", "add_my_tags")],
          [Markup.callbackButton("🔄 Сгенерировать", "auto_my_tags")],


          // [Markup.callbackButton("❌ Удалить все домены", "delete_my_domains")],

          [Markup.callbackButton("◀️ Назад", "settings")],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
