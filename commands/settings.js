const { Markup } = require("telegraf");
const locale = require("../locale");
const { Service } = require("../database");

module.exports = async (ctx) => {
  await ctx.answerCbQuery("⚙️ Настройки открыты").catch((err) => err);

  return ctx
    .replyOrEdit(
      `⚙️ Настройки`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("👥 Профили", "profiles"),
            Markup.callbackButton("📋 Шаблоны", "supportTemp"),
          ],
          [
            Markup.callbackButton("👛 Кошелек", "change_trc"),
          ],
          [
            Markup.callbackButton("🔔 Уведомления", "notifications"),
            Markup.callbackButton("⭐ Избранные", "mainService"),
          ],
          [Markup.callbackButton("🏷️ Управление тегами", "settings_my_tags")],

          [
            Markup.callbackButton("🤖 Автоматическое-ТП", "auto_tp"),


            Markup.callbackButton("🔗 Личные домены", "settings_my_domains"),
          ],
          [
            Markup.callbackButton(
              ctx.state.user.hideService ? "🙉 Показать сервис" : "🙈 Скрыть сервис",
              `settings_service_${ctx.state.user.hideService ? "show" : "hide"}`
            ),
            Markup.callbackButton(
              ctx.state.user.hideNick ? "🙉 Показать ник" : "🙈 Скрыть ник",
              `settings_nickname_${ctx.state.user.hideNick ? "show" : "hide"}`
            ),
          ],
          [
            Markup.callbackButton(
              `💳 Страница ввода карты: ${ctx.state.user.provider === "square" ? "Square" : "Stripe"
              }`,
              `settings_provider_${ctx.state.user.provider === "square" ? "stripe" : "square"
              }`
            ),
          ],
           [
            Markup.callbackButton(
              `💬 Авто-открытие чата: ${ctx.state.user.autoOpenChat ? "Включено" : "Выключено"}`,
              `settings_autochat_${ctx.state.user.autoOpenChat ? "disable" : "enable"}`
            ),
          ],
          // [
          //   Markup.callbackButton("🎨 Оформление профита", "set_profit_media"),
          // ],
          [
            Markup.callbackButton("🎁 Реферальная система", "referrals"),
          ],
          [
            Markup.callbackButton("⚠️ Сообщить о проблеме", "admin_sms"),
          ],
          [
            Markup.callbackButton("◀️ Главное меню", "start"),
          ],
        ]),
      }
    )
    .catch((err) => err);
};
