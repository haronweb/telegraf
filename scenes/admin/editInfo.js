const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const settings = require("../../commands/admin/settings");
const log = require("../../helpers/log");
const { Settings } = require("../../database");


const scene = new WizardScene(
  "admin_edit_info",
  async (ctx) => {
    try {
      await ctx.scene.reply("✍️ Введите правила проекта ", {
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
      ctx.wizard.state.info = ctx.message.text;

      await Settings.update(
        {
          info: ctx.wizard.state.info,
          
        },
        { where: { id: 1 } }
      );
      await ctx.scene.reply("✅ Правила установлены!", {
        reply_markup: Markup.inlineKeyboard([
          // [Markup.callbackButton("Назад", "admin_domains")],
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
scene.leave(settings);


module.exports = scene