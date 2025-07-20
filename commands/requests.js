const { Markup } = require("telegraf");
const locale = require("../locale");

module.exports = async (ctx) => {
  const settings = ctx.state.bot || {};
  const data = ctx.callbackQuery?.data;

  // Показать правила
  if (data === "toggle_rules") {
    await ctx.answerCbQuery("Открываю правила...").catch(() => {});

    const rules = settings.info || "Правила пока не заданы.";

    return ctx.replyOrEdit(`<b>📜 Правила проекта</b>\n\n<blockquote>${rules}</blockquote>`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([

        [Markup.callbackButton("🔽 Скрыть правила", "back_to_request")],
                      [Markup.callbackButton(locale.requests.ready_send_button, "send_request")],

      ]),
    }).catch(() => {});
  }

  // Вернуться назад к подаче заявки
  if (data === "back_to_request") {
    await ctx.answerCbQuery("Возврат...").catch(() => {});
  }

  // Основной текст заявки
  const text = locale.requests.need_send_request.replace(`{name}`, `${ctx.from.first_name}`);

  return ctx.replyOrEdit(text, {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("📜 Правила проекта", "toggle_rules")],

      [Markup.callbackButton(locale.requests.ready_send_button, "send_request")],
    ]),
  }).catch(() => {});
};
