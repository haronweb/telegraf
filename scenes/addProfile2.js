const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Profiles } = require("../database");
const profiles = require("../commands/profiles");

const scene = new WizardScene(
  "add_profile2",
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch((err) => err);

      await ctx.answerCbQuery("Создаю профиль! ").catch((err) => err);

      await ctx.scene
        .reply("Введи название профиля", {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "profiles_cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.title = ctx.message.text;

      await ctx.scene
        .reply("Введите имя покупателя (Формат: Имя Фамилия)", {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "profiles_cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.name = ctx.message.text;

      await ctx.scene
        .reply("Введите адрес покупателя", {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "profiles_cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.address = ctx.message.text;

      await Profiles.create({
        userId: ctx.from.id,
        username: ctx.from.username,
        title: ctx.wizard.state.title,
        address: ctx.wizard.state.address,
        name: ctx.wizard.state.name,
      });

      await ctx.scene
        .reply(
          `<b>✅ Профиль успешно создан!</b>
        
<i>Теперь вы можете его использовать при создание ссылки</i> `,
          {
            parse_mode: "HTML",

            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("🔗 Создать объявление", "create_link1")],
              [Markup.callbackButton("◀️ В главное меню", "start")],
            ]),
          }
        )
        .catch((err) => err);
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
