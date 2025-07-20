const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { User } = require("../database");
const myTags = require("../commands/MyTags"); // подключаем твой MyTags.js

const scene = new WizardScene(
  "add_my_tags",
  async (ctx) => {
    try {
      
      await ctx.answerCbQuery("Создаю тег! ").catch((err) => err);

      await ctx.replyOrEdit("Введите ваш тег (без #)", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      }).catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      const inputTag = ctx.message.text.trim();

      // Проверка на запрещённые символы
      if (inputTag.includes("<") || inputTag.includes(">")) {
        await ctx.reply("❌ Тег не должен содержать символы < >. Пожалуйста, введите другой тег.",{
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }).catch((err) => err);
        return ctx.wizard.selectStep(1);
      }

      // Проверка длины тега
      if (inputTag.length > 20) {
        await ctx.reply("❌ Ваш тег слишком длинный. Пожалуйста, введите другой.",{
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }).catch((err) => err);
        return ctx.wizard.selectStep(1);
      }

      // Проверка на занятость тега
      const existingTag = await User.findOne({ where: { tag: inputTag } });
      if (existingTag) {
        await ctx.reply("❌ Этот тег уже занят другим пользователем. Пожалуйста, укажите другой тег.",{
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }).catch((err) => err);
        return ctx.wizard.selectStep(1);
      }

      // Сохраняем тег
      await User.update({ tag: inputTag }, { where: { id: ctx.from.id } });

      await ctx.replyOrEdit(`✅ Вам был успешно присвоен тег <b>#${inputTag}</b>`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", `settings_my_tags`)],
        ]),
      }).catch((err) => err);

      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
