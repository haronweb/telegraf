const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const myAd = require("../../commands/myCreateAd");
const { Ad } = require("../../database");
const log = require("../../helpers/log");
// const myAd = require("../../commands/myCreateAd");


const scene = new WizardScene(
  "my_ad_edit_title",
  async (ctx) => {
    try {
      await  ctx.answerCbQuery("Ожидаю новое название... ").catch((err) => err)

      const ad = await Ad.findOne({
        where: {
          id: ctx.scene.state.adId,
          userId: ctx.from.id,
        },
      });
      if (!ad) {
        ctx.replyOrEdit("❌ Объявление не найдено").catch((err) => err);
        return ctx.scene.leave();
      }

      await ctx.replyOrEdit("Введите новое название", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
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
      var title = ctx.message?.text;

      const ad = await Ad.findOne({
        where: {
          id: ctx.scene.state.adId,
          userId: ctx.from.id,
        },
        include: [
          {
            association: "service",
            required: true,
            include: [
              {
                association: "currency",
                required: true,
              },
            ],
          },
        ],
      });
      if (!ad) {
        ctx.replyOrEdit("❌ Объявление не найдено").catch((err) => err);
        return ctx.scene.leave();
      }
      var before_title = ad.title;

      await ad.update({
        title,
      });
      log(
        ctx,
        `изменил название для объявления <code>(ID: ${ad.id})</code> с <b>${before_title} на ${title}</b>`
      );

    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));

module.exports = scene;
