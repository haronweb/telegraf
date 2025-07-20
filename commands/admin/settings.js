const { Markup } = require("telegraf");
const locale = require("../../locale");

module.exports = async (ctx) => {
  try {
    if (ctx.state.user.status === 1) {
      const settings = ctx.state.bot;

   return ctx.replyOrEdit(
        `<b>⚙️ Настройки бота</b>

Проект: <b>${settings.work ? "работает" : "не работает"}</b>
Заявки: <b>${settings.requestsEnabled ? "включены" : "выключены"}</b>
Логи в общий чат: <b>${settings.allLogsEnabled ? "включены" : "выключены"}</b>
Приветственное сообщение при вступлении в общий чат: <b>${
          settings.allHelloMsgEnabled ? "включено" : "выключено"
        }</b>
Правила: ${settings.info == null ? `<b>не установлены</b>` : `<b>установлены</b>`}

Ссылка на общий чат: <b>${settings.allGroupLink || "не задано"}</b>
Ссылка на канал выплат: <b>${settings.payoutsChannelLink || "не задано"}</b>

Процент воркера за залёт: <b>${settings.payoutPercent}%</b>
Процент вознаграждения рефералу: <b>${settings.referralPercent}%</b>

`,
        {
          disable_web_page_preview: true,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                ctx.state.bot.work ? "❌ STOP WORK" : "✅ FULL WORK",
                `admin_projectStatus_${ctx.state.bot.work ? "stop" : "work"}`
              ),
            ],
            [
              Markup.callbackButton(
                settings.requestsEnabled ? "❌ Выключить заявки" : "✅ Включить заявки",
                `admin_turn_${settings.requestsEnabled ? "off" : "on"}_requestsEnabled`
              ),
            ],
            [
              Markup.callbackButton(
                settings.allLogsEnabled ? "❌ Выключить логи в общий чат" : "✅ Включить логи в общий чат",
                `admin_turn_${settings.allLogsEnabled ? "off" : "on"}_allLogsEnabled`
              ),
            ],
            [
              Markup.callbackButton(
                settings.allHelloMsgEnabled ? "❌ Выключить приветственное сообщение" : "✅ Включить приветственное сообщение",
                `admin_turn_${settings.allHelloMsgEnabled ? "off" : "on"}_allHelloMsgEnabled`
              ),
            ],
            [Markup.callbackButton("💬 Изменить ссылку на общий чат", `admin_edit_allGroupLink`)],
            [Markup.callbackButton("💸 Изменить ссылку на канал выплат", `admin_edit_payoutsChannelLink`)],
            [Markup.callbackButton("💴 Изменить процент воркера за залёт", "admin_edit_payoutPercent")],
            [Markup.callbackButton("🎁 Изменить процент реферала", "admin_edit_referralPercent")],
                        [Markup.callbackButton("📜 Изменить правила проекта", `admin_edit_info`)],

            [Markup.callbackButton(locale.go_back, "admin")],
          ]),
        }
      );
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch(() => {});
  }
};
