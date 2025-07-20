const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const { Service, Ad, Settings } = require("../../database");
const locale = require("../../locale");
const axios = require("axios");

module.exports = async (ctx, id) => {
  try {
    const service = await Service.findByPk(id, {
      include: [
        {
          association: "country",
          required: true,
        },
      ],
    });

    if (!service)
      return ctx
        .replyOrEdit("❌ Сервис не найден", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", `admin_services_1`)],
          ]),
        })
        .catch((err) => err);

    const serviceAdsCount = await Ad.count({
      where: {
        serviceCode: service.code,
      },
    });

  const buttons = [];

// 📁 Группа: Домены
buttons.push([
  Markup.callbackButton("🌐 Подключить домен", `admin_service_${service.id}_add_domain`),
  Markup.callbackButton("📝 Задать домен", `admin_service_${service.id}_edit_domain`),
]);
if (service.domain && service.zone) {
  buttons.push([
    Markup.callbackButton("🗑 Удалить домен", `admin_service_${service.id}_delete_domain`),
  ]);
}


// 📁 Группа: Сокращалка
buttons.push([
  Markup.callbackButton("✂️ Подключить сокращалку", `admin_service_${service.id}_add_shortlink`),
  Markup.callbackButton("📝 Задать сокращалку", `admin_service_${service.id}_edit_shortlink`),
]);
if (service.shortlink && service.shortlinkZone) {
  buttons.push([
    Markup.callbackButton("🗑 Удалить сокращалку", `admin_service_${service.id}_delete_shortlink`),
  ]);
}


   // 📁 Группа: Капча
if (service.zone) {
  try {
    const settings = await Settings.findOne({ where: { id: 1 } });
    const statusRes = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${service.zone}/settings/security_level`,
      {
        headers: {
          "X-Auth-Email": settings.cf_mail,
          "X-Auth-Key": settings.cf_api,
          "Content-Type": "application/json",
        },
      }
    );
    const level = statusRes.data.result.value;
    const text =
      level === "under_attack" ? "🔴 Выключить капчу" : "🟢 Включить капчу";
    buttons.push([
      Markup.callbackButton(text, `toggle_captcha_zone_${service.id}`),
    ]);
  } catch (e) {
    console.warn("⚠️ Ошибка получения статуса капчи домена:", e.message);
  }
}

if (service.shortlinkZone) {
  try {
    const settings = await Settings.findOne({ where: { id: 1 } });
    const statusRes = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${service.shortlinkZone}/settings/security_level`,
      {
        headers: {
          "X-Auth-Email": settings.cf_mail,
          "X-Auth-Key": settings.cf_api,
          "Content-Type": "application/json",
        },
      }
    );
    const level = statusRes.data.result.value;
    const text =
      level === "under_attack"
        ? "🔴 Выключить капчу (сокращалка)"
        : "🟢 Включить капчу (сокращалка)";
    buttons.push([
      Markup.callbackButton(text, `toggle_captcha_shortlink_${service.id}`),
    ]);
  } catch (e) {
    console.warn("⚠️ Ошибка получения статуса капчи сокращалки:", e.message);
  }
}

// 👁 Группа: Видимость
buttons.push([
  Markup.callbackButton(
    service.status == 1 ? "👁 Скрыть сервис" : "👁 Отображать сервис",
    `admin_service_${service.id}_${service.status == 1 ? "hide" : "show"}`
  ),
]);

// ◀️ Навигация
buttons.push([Markup.callbackButton("◀️ Назад", `admin_services_1`)]);

    // Ответ
    return ctx
      .replyOrEdit(
        `<b>📦 Сервис: "${service.title}"</b>

🌎 Страна: <b>${service.country.title}</b>
📂 Объявлений: <b>${serviceAdsCount}</b>
🔗 Активный домен: <b>${service.domain}</b>
✂️ Сокращалка: <b>${service.shortlink ? service.shortlink : "отсутствует"}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard(buttons),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.error("❌ Ошибка в выводе сервиса:", err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
