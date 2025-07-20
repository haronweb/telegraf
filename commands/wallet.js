const { Markup } = require("telegraf");

module.exports = async (ctx) => {
  try {
    const trc = ctx.state.user.trc;

    await ctx.replyOrEdit(
      `
<b>👛 Ваш USDT-кошелек</b>

Текущий кошелёк: <code>${trc == null ? "🚫 Не установлен" : trc}</code>
      `,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: Markup.inlineKeyboard([
          ...(trc == null
            ? [[Markup.callbackButton(`➕ Установить кошелёк`, `changetrc`)]]
            : [[Markup.callbackButton(`♻️ Сменить кошелёк`, `changetrc`)]]),
          [Markup.callbackButton(`◀️ Назад`, `settings`)],
        ]),
      }
    );
  } catch (err) {
    console.log("❌ Ошибка в change_trc:", err);
    return ctx.reply("❌ Произошла ошибка").catch(() => {});
  }
};
