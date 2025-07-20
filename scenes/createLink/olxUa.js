const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service,Profiles } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const menu = require("../../commands/menu");
const myAd = require("../../commands/myAd");

const faker = require("faker/locale/uk");

const olx_ua_domains = ["www.olx.ua", "m.olx.ua", "olx.ua"];

const scene = new WizardScene(
  "create_link_olx_ua",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "olx_ua",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, "перешёл к созданию ссылки OLX.UA");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Отправьте ссылку на объявление OLX.UA", {
        reply_markup: Markup.inlineKeyboard([
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
      if (!ctx.message.text) return ctx.wizard.prevStep();
      var url;
      try {
        url = new URL(ctx.message.text);
      } catch (err) {
        await ctx.replyOrEdit("❌ Введите валидную ссылку").catch((err) => err);
        return ctx.wizard.prevStep();
      }
      if (!olx_ua_domains.includes(url.host)) {
        await ctx
          .replyOrEdit("❌ Введите ссылку на объявление OLX.UA")
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }
      url.host = url.host
        .replace("m.olx.ua", "olx.ua")
        .replace("olx.ua/oferta", "olx.ua/d/oferta");
      url.hostname = url.host;

      log(ctx, `отправил ссылку для парсинга OLX.UA (${url.href})`);

      await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
      const ad = await axios.get(encodeURI(url.href)),
        $ = cheerio.load(ad.data);

      const info = {
        title: $('[data-cy="ad_title"]').text().trim(),
        price: $('[data-testid="ad-price-container"]').text().trim(),
        adLink: url.href,
      };
      try {
        info.photo = $(".swiper-zoom-container img").first().attr("src");
      } catch (err) {}

      if (!info.title || !info.price) {
        await ctx.scene
          .reply("❌ Не удалось спарсить объявление")
          .catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, `спарсил объявление OLX.UA (${url.href})`);
      ctx.scene.state.data = info;
     
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
   async(ctx) => {
    try {
      const profiles = await Profiles.findAll({where: {userId: ctx.from.id}})

      var buttons = profiles.map((v) => [
        Markup.callbackButton(v.title, v.id)
      ])

      await ctx.scene
      .reply(`Выберите профиль`, {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("Отменить", "cancel")],
        ])
      })
      return ctx.wizard.next()
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    } 
  },
 
  async (ctx) => {
    try {
      const profiles = await Profiles.findOne({where: {id: ctx.callbackQuery.data}})
      
      ctx.scene.state.data.address = profiles.address
      ctx.scene.state.data.name = profiles.name
      ctx.scene.state.data.phone = profiles.phone
      await ctx
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
      console.log(err)
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery.data)) return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";
      return ctx.wizard.nextStep()
    } catch (err) {
      console.log(err)
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "olx_ua",
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
        serviceCode: "olx_ua",
      });
    log(ctx, `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`);
    // Собираем сообщение 
try {
  await myAd(ctx, ad.id);
} catch (err) {
  await ctx.replyOrEdit("❌ Ошибка при отображении объявления.").catch(() => {});
}
      ctx.updateType = "message";
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);
scene.leave(menu);


module.exports = scene;

