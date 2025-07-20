const { Markup } = require("telegraf");
const { Settings } = require("../../database");
const axios = require("axios");

module.exports = async (ctx) => {
  try {
    const settings = await Settings.findOne({ where: { id: 1 } });

    let cfStatusText = "";
    let shortlinkStatusText = "";

    if (settings.cf_mail && settings.cf_api) {
      // Проверка общего домена
      if (settings.cf_id_domain) {
        try {
          const cfRes = await axios.get(
            `https://api.cloudflare.com/client/v4/zones/${settings.cf_id_domain}/settings/security_level`,
            {
              headers: {
                "X-Auth-Email": settings.cf_mail,
                "X-Auth-Key": settings.cf_api,
                "Content-Type": "application/json",
              },
            }
          );
          const level = cfRes.data.result.value;
          cfStatusText =
            level === "under_attack"
              ? "\n🛡️ Капча общего домена: <b>включена</b>"
              : "\n🛡️ Капча общего домена: <b>выключена</b>";
        } catch (err) {
          console.warn(
            "⚠️ Ошибка получения статуса Cloudflare (общий домен):",
            err.message
          );
          cfStatusText = "\n🛡️ Капча общего домена: <b>⚠️ неизвестна</b>";
        }
      }

      // Проверка сокращалки
      if (settings.shortlinkZone) {
        try {
          const cfRes = await axios.get(
            `https://api.cloudflare.com/client/v4/zones/${settings.shortlinkZone}/settings/security_level`,
            {
              headers: {
                "X-Auth-Email": settings.cf_mail,
                "X-Auth-Key": settings.cf_api,
                "Content-Type": "application/json",
              },
            }
          );
          const level = cfRes.data.result.value;
          shortlinkStatusText =
            level === "under_attack"
              ? "🛡️ Капча сокращалки: <b>включена</b>"
              : "🛡️ Капча сокращалки: <b>выключена</b>";
        } catch (err) {
          console.warn(
            "⚠️ Ошибка получения статуса Cloudflare (сокращалка):",
            err.message
          );
          shortlinkStatusText = "\n✂️ Капча сокращалки: <b>⚠️ неизвестна</b>";
        }
      }
    }

    return ctx
      .replyOrEdit(
        `
${
  settings.cf_mail == null
    ? "ℹ️ Для работы необходимо добавить аккаунт Cloudflare"
    : `ℹ️ Используемый аккаунт Cloudflare: <b>${settings.cf_mail}</b>`
}

${
  settings.domain
    ? `🌐 Общий домен: <b>${settings.domain}</b>`
    : "❌ Общий домен не настроен"
}
${
  settings.shortlink
    ? `✂️ Общая сокращалка: <b>${settings.shortlink}</b>`
    : "❌ Общая сокращалка не настроена"
}
${cfStatusText}
${shortlinkStatusText}
        `,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            ...(settings.cf_mail == null
              ? []
              : [
                  [
                    Markup.callbackButton("➕ Общий", "admin_domain_add"),
                    Markup.callbackButton(
                      "➕ Запасной",
                      "admin_domain_addZapasnoy"
                    ),
                  ],
                ]),
            [
              Markup.callbackButton("➕ Сокращалка", "admin_reduction"),
            ],
            ...(settings.cf_id_domain
              ? [
                  [
                    Markup.callbackButton(
                      cfStatusText.includes("включена")
                        ? "🔴 Выключить капчу (общий домен)"
                        : "🟢 Включить капчу (общий домен)",
                      "admin_toggle_under_attack_domain"
                    ),
                  ],
                ]
              : []),
            ...(settings.shortlinkZone
              ? [
                  [
                    Markup.callbackButton(
                      shortlinkStatusText.includes("включена")
                        ? "🔴 Выключить капчу (сокращалка)"
                        : "🟢 Включить капчу (сокращалка)",
                      "admin_toggle_under_attack_shortlink"
                    ),
                  ],
                ]
              : []),
            [
              Markup.callbackButton(
                "📄 Список запасных доменов",
                "admin_zapasnie"
              ),
            ],
            [
              Markup.callbackButton(
                "🔄 Обновить данные cloudflare.com",
                "admin_domains_cf"
              ),
            ],
            [Markup.callbackButton("◀️ Назад", "admin")],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.error("❌ Ошибка в admin_domains.js:", err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
