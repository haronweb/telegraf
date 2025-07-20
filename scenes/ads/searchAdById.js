const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad } = require("../../database");
const myAd = require("../../commands/myCreateAd");
const myAds = require("../../commands/myAds");

const { Op } = require("sequelize");

const scene = new WizardScene(
  "searchAdById",
  async (ctx) => {
    try {
      await ctx.replyOrEdit("🔍 Введите ID, сокращённую ссылку или ссылку с личным доменом для поиска объявления:\n\nПримеры:\n<code>#id123456789</code>\n<code>123456789</code>", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "canceled")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    // 🟥 ВСТАВЛЯЕШЬ СЮДА:
    if (ctx.updateType === "callback_query" && ctx.update.callback_query.data === "canceled") {
      await ctx.answerCbQuery();
      // await ctx.editMessageText("❌ Поиск отменён.");
      await myAds(ctx); // ← Здесь вызываешь myAds!
      return ctx.scene.leave();
    }
  
    // 🔽 Всё что ниже — остаётся без изменений!
    try {
      const input = ctx.message?.text?.trim();
      if (!input) {
        await ctx.scene.reply("❌ Пожалуйста, введите данные для поиска.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "canceled")],
          ]),
        });
        return ctx.wizard.selectStep(0);
      }

      // Удаляем # и id если есть
      const cleanedInput = input
        .toLowerCase()
        .replace(/[#\s]/g, "")
        .replace(/^id/, "");

      let ad;

      // Если это цифры — ищем по ID
      if (/^\d+$/.test(cleanedInput)) {
        ad = await Ad.findOne({
          where: {
            id: parseInt(cleanedInput),
            userId: ctx.from.id,
          },
          include: [
            {
              association: "service",
              required: true,
              include: [
                { association: "currency", required: true },
                { association: "country", required: true },
              ],
            },
          ],
        });
      } else {
        // Ищем по shortLink или myDomainLink
        ad = await Ad.findOne({
          where: {
            userId: ctx.from.id,
            [Op.or]: [
              { shortLink: cleanedInput },
              { myDomainLink: cleanedInput },
            ],
          },
          include: [
            {
              association: "service",
              required: true,
              include: [
                { association: "currency", required: true },
                { association: "country", required: true },
              ],
            },
          ],
        });
      }

      if (!ad) {
        await ctx.scene.reply("❌ Объявление не найдено по введённым данным.");
        return ctx.scene.leave();
      }

      // Открываем объявление через myAd
      await myAd(ctx, ad.id);
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при поиске объявления.").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

module.exports = scene;
