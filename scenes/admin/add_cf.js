const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Settings } = require("../../database");

const scene = new WizardScene(
  "add_cf",
  async (ctx) => {
    try {
      await ctx.scene.reply("1️⃣ Введи почту от аккаунт cloudflare.com", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отмена", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.cf_mail = ctx.message.text;

      await ctx.scene.reply(
        "2️⃣ Введи Global API Key от аккаунт cloudflare.com",
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отмена", "cancel")],
          ]),
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.cf_api = ctx.message.text;
      await ctx.scene.reply("3️⃣ Введи ID от аккаунт cloudflare.com", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отмена", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.cf_id = ctx.message.text;

      await Settings.update(
        {
          cf_mail: ctx.wizard.state.cf_mail,
          cf_id: ctx.wizard.state.cf_id,
          cf_api: ctx.wizard.state.cf_api,
        },
        { where: { id: 1 } }
      );
      await ctx.scene.reply("✅ Данные от аккаунта были обновлены", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Назад", "admin_domains")],
        ]),
      });
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene