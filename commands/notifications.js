const { Markup } = require("telegraf");

module.exports = async (ctx) => {
  return ctx.replyOrEdit(`🔔 Настройки уведомлений`, {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard([
      [
        Markup.callbackButton(
          ctx.state.user.perehod
            ? "🔕 Переходы по ссылке: выкл"
            : "🔔 Переходы по ссылке: вкл",
          `perehod_${ctx.state.user.perehod ? "off" : "on"}`
        ),
      ],
      [
        Markup.callbackButton(
          ctx.state.user.card
            ? "🔕 Ввод карты: выкл"
            : "🔔 Ввод карты: вкл",
          `card_${ctx.state.user.card ? "off" : "on"}`
        ),
      ],
      [
        Markup.callbackButton(
          ctx.state.user.autotp
            ? "🔕 Авто-ТП уведомления: выкл"
            : "🔔 Авто-ТП уведомления: вкл",
          `autotp_${ctx.state.user.autotp ? "off" : "on"}`
        ),
      ],
      [Markup.callbackButton("◀️ Назад", "settings")],
    ]),
  }).catch((err) => err);
};
