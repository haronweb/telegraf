const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const log = require("../helpers/log");
const axios = require("axios");
const moment = require("moment-timezone");

const scene = new WizardScene("screenshot3", async (ctx) => {
  const adId = ctx.scene.state?.adId;
  if (!adId) {
    await safeReply(ctx, "❌ Ошибка: ID объявления не передан.");
    return ctx.scene.leave();
  }

  await safeAnswerCbQuery(ctx, "⏳ Подождите, идет генерация...");
  ctx.scene.leave(); // ← мгновенный выход из сцены

  setImmediate(async () => {
    try {
      const ad = await Ad.findOne({ where: { id: adId } });
      if (!ad) return safeReply(ctx, "❌ Ошибка: Объявление не найдено.");

      const service = await Service.findOne({ where: { code: ad.serviceCode } });
      if (!service) return safeReply(ctx, "❌ Ошибка: Сервис не найден.");

      const domain = "https://k65cbre31czd.gscreen.gg";
      const apiKey = "1a96eec77ccc072b03c6fd9bf8008037";
      const [serviceCode, countryCode] = service.code.split("_") || [];

      const effectiveCountryCode = ["fiverr_com", "fiverr_eu", "etsyverif_eu", "etsy_eu"].includes(service.code)
        ? "all_world"
        : countryCode || "all_world";

      const timezones = moment.tz.zonesForCountry(effectiveCountryCode.toUpperCase());
      const timezone = Array.isArray(timezones) && timezones.length ? timezones[0] : "Europe/London";

      const currentTime = moment().tz(timezone).format("HH:mm");
      const currentDate = moment().tz(timezone).format("DD.MM.YYYY");

      const templateTypes = ["screen-mail", "screen"];
      let allVariants = [];

      async function loadTemplates(params) {
        try {
          const res = await axios.get(`${domain}/templates`, { params, timeout: 6000 });
          return Array.isArray(res.data?.data) ? res.data.data : [];
        } catch (err) {
          const status = err.response?.status;
          if (status === 400) {
            console.warn(`⚠️ 400 Bad Request: Нет шаблонов для service=${params.service}, type=${params.type}, country=${params.country}`);
            return [];
          }
          console.error("❌ Ошибка при получении шаблонов:", err.message);
          return [];
        }
      }

      for (const type of templateTypes) {
        let templates = await loadTemplates({ key: apiKey, type, country: effectiveCountryCode, service: serviceCode });
        if (templates.length === 0 && effectiveCountryCode !== "all_world") {
          templates = await loadTemplates({ key: apiKey, type, country: "all_world", service: serviceCode });
        }
        allVariants.push(...templates);
      }

      if (allVariants.length === 0) {
        const fallbackTemplateId = service.code.endsWith("uk") ? 914397051 : 561154541;
        console.log(`🔁 Используем шаблон по умолчанию id=${fallbackTemplateId}`);
        const defaultTemplate = await loadTemplates({ key: apiKey, template_id: fallbackTemplateId });
        if (defaultTemplate.length > 0) allVariants.push(...defaultTemplate);
      }

      if (allVariants.length === 0) {
        await safeReply(ctx, "❌ Ошибка: Нет доступных шаблонов.");
        return;
      }

      let screenshotsGenerated = 0;
      const price = (ad.price || "0").replace(/[^0-9.,-]/g, "");
      const cleanPrice = price.replace(/\s/g, "").replace(/,/g, ".").replace(/(?<=\d)\.(?=\d{3}(\D|$))/g, "");

      for (const variant of allVariants) {
        const variables = {};
        for (const variable of variant.variables || []) {
          switch (variable) {
            case "$price": variables["$price"] = cleanPrice; break;
            case "$name": variables["$name"] = ad.name; break;
            case "$product": variables["$product"] = ad.title; break;
            case "$service": variables["$service"] = service.title?.replace(/^[^\p{L}\p{N}]+/u, "").trim() || ""; break;
            case "$time": variables["$time"] = currentTime; break;
            case "$date": variables["$date"] = currentDate; break;
          }
        }

        const data = {
          id: variant.id,
          data: { variables },
          return_type: "base64",
          client_id: ctx.from.id,
          client_username: ctx.from.username || "Unknown"
        };

        try {
          const response = await axios.post(`${domain}/render?key=${apiKey}`, data, {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            timeout: 15000
          });

          const base64String = response.data?.data;
          if (base64String) {
            const buffer = Buffer.from(base64String, "base64");
            await safeReplyWithPhoto(ctx, buffer, `<b>✅ Скриншот успешно сгенерирован.</b>`);
            await ad.update({ screen3: 1 });
            screenshotsGenerated++;
          } else {
            await safeReply(ctx, `⚠️ Непредвиденный ответ от API для варианта ${variant.id}.`);
          }
        } catch (err) {
          const errorText = err.response?.data?.error_message || err.message || "Неизвестная ошибка";
          if (!errorText.toLowerCase().includes("aborted")) {
            console.error(`❌ Ошибка API для варианта ${variant.id}:`, errorText);
            await safeReply(ctx, `❌ Ошибка при генерации скриншота для варианта ${variant.id}:\n<b>${errorText}</b>`, "HTML");
          }
        }
      }

      if (screenshotsGenerated === 0) {
        await safeReply(ctx, "❌ Ошибка: не удалось получить данные скриншотов.");
      } else {
        log(ctx, `Сгенерировал ${screenshotsGenerated} скриншота(ов) через API.`);
      }
    } catch (err) {
      console.error("❌ Глобальная ошибка при генерации экранов:", err);
      await safeReply(ctx, `❌ Ошибка генерации экранов: ${err.message}`, "HTML");
    }
  });
});

// Обёртки
async function safeReply(ctx, text, parseMode) {
  try {
    await ctx.reply(text, parseMode ? { parse_mode: parseMode } : {});
  } catch (e) {
    console.error("❌ Ошибка при отправке reply:", e.message);
  }
}

async function safeReplyWithPhoto(ctx, buffer, caption) {
  try {
    await ctx.replyWithPhoto({ source: buffer }, {
      parse_mode: "HTML",
      caption,
      reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("❌ Скрыть", "delete")]])
    });
  } catch (e) {
    console.error("❌ Ошибка при отправке фото:", e.message);
  }
}

async function safeAnswerCbQuery(ctx, text) {
  try {
    await ctx.answerCbQuery(text);
  } catch (e) {
    console.error("❌ Ошибка при отправке answerCbQuery:", e.message);
  }
}

module.exports = scene;
