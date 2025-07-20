const axios = require("axios");
const { Settings } = require("../../database");
const { Markup } = require("telegraf");

module.exports = async (ctx) => {
  try {
    const settings = await Settings.findOne({ where: { id: 1 } });
    if (!settings.cf_mail || !settings.cf_api) {
      return ctx
        .answerCbQuery("❌ Настройки Cloudflare не найдены", {
          show_alert: true,
        })
        .catch(() => {});
    }

    const type = ctx.match[1]; // domain или shortlink
    let zoneId;
    let domainName;

    if (type === "domain") {
      zoneId = settings.cf_id_domain;
      domainName = settings.domain;
    } else if (type === "shortlink") {
      zoneId = settings.shortlinkZone;
      domainName = settings.shortlink;
    } else {
      return ctx
        .answerCbQuery("❌ Неверный тип запроса", {
          show_alert: true,
        })
        .catch(() => {});
    }

    if (!zoneId || !domainName) {
      return ctx
        .answerCbQuery("❌ Домен или зона не найдены", {
          show_alert: true,
        })
        .catch(() => {});
    }

    // Получаем текущий уровень защиты выбранной зоны
    const res = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`,
      {
        headers: {
          "X-Auth-Email": settings.cf_mail,
          "X-Auth-Key": settings.cf_api,
        },
      }
    );

    const currentMode = res.data.result.value;
    const newMode = currentMode === "low" ? "under_attack" : "low";

    // Меняем уровень защиты
    await axios.patch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`,
      { value: newMode },
      {
        headers: {
          "X-Auth-Email": settings.cf_mail,
          "X-Auth-Key": settings.cf_api,
        },
      }
    );

    // ⚡ Теперь — отдельно запрашиваем статус домена и сокращалки
    let domainCaptchaStatus = "";
    let shortlinkCaptchaStatus = "";

    if (settings.cf_id_domain) {
      try {
        const resDomain = await axios.get(
          `https://api.cloudflare.com/client/v4/zones/${settings.cf_id_domain}/settings/security_level`,
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
            },
          }
        );
        domainCaptchaStatus =
          resDomain.data.result.value === "under_attack"
            ? "🛡️ Капча общего домена: <b>включена</b>"
            : "🛡️ Капча общего домена: <b>выключена</b>";
      } catch (err) {
        domainCaptchaStatus = "🛡️ Капча общего домена: <b>⚠️ неизвестна</b>";
      }
    }

    if (settings.shortlinkZone) {
      try {
        const resShortlink = await axios.get(
          `https://api.cloudflare.com/client/v4/zones/${settings.shortlinkZone}/settings/security_level`,
          {
            headers: {
              "X-Auth-Email": settings.cf_mail,
              "X-Auth-Key": settings.cf_api,
            },
          }
        );
        shortlinkCaptchaStatus =
          resShortlink.data.result.value === "under_attack"
            ? "🛡️ Капча сокращалки: <b>включена</b>"
            : "🛡️ Капча сокращалки: <b>выключена</b>";
      } catch (err) {
        shortlinkCaptchaStatus = "🛡️ Капча сокращалки: <b>⚠️ неизвестна</b>";
      }
    }

    const generalDomainText = settings.domain
      ? `🌐 Общий домен: <b>${settings.domain}</b>`
      : "❌ Общий домен не настроен";

    const shortlinkDomainText = settings.shortlink
      ? `✂️ Общая сокращалка: <b>${settings.shortlink}</b>`
      : "❌ Общая сокращалка не настроена";

    const keyboard = [
      [
        Markup.callbackButton("➕ Общий", "admin_domain_add"),
        Markup.callbackButton("➕ Запасной", "admin_domain_addZapasnoy"),
      ],
      [
        Markup.callbackButton("➕ Сокращалка", "admin_reduction"),
      ],
    ];

    if (settings.cf_id_domain) {
      keyboard.push([
        Markup.callbackButton(
          domainCaptchaStatus.includes("выключена")
            ? "🟢 Включить капчу (домен)"
            : "🔴 Выключить капчу (домен)",
          "admin_toggle_under_attack_domain"
        ),
      ]);
    }

    if (settings.shortlinkZone) {
      keyboard.push([
        Markup.callbackButton(
          shortlinkCaptchaStatus.includes("выключена")
            ? "🟢 Включить капчу (сокращалка)"
            : "🔴 Выключить капчу (сокращалка)",
          "admin_toggle_under_attack_shortlink"
        ),
      ]);
    }

    keyboard.push(
      [Markup.callbackButton("📄 Список запасных доменов", "admin_zapasnie")],
      [
        Markup.callbackButton(
          "🔄 Обновить данные cloudflare.com",
          "admin_domains_cf"
        ),
      ],
      [Markup.callbackButton("◀️ Назад", "admin")]
    );

    await ctx.editMessageText(
      `
ℹ️ Используемый аккаунт Cloudflare: <b>${settings.cf_mail}</b>

${generalDomainText}
${shortlinkDomainText}

${domainCaptchaStatus}
${shortlinkCaptchaStatus}
      `.trim(),
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard(keyboard),
      }
    );

    await ctx.answerCbQuery(
      newMode === "under_attack" ? "🛡️ Капча включена" : "🛡️ Капча выключена",
      { show_alert: false }
    );
  } catch (err) {
    console.error(
      "❌ Ошибка при переключении капчи:",
      err.response?.data || err.message
    );
    return ctx
      .answerCbQuery("❌ Ошибка при переключении капчи", {
        show_alert: true,
      })
      .catch(() => {});
  }
};
