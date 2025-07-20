const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Settings } = require("../../database");
const admin = require("../../commands/admin/admin");

const scene = new WizardScene(
  "admin_cookie",
  async (ctx) => {
    try {
      await ctx.scene.reply("🍪 Введите ваши куки ETSY.COM (в одну строку):", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const cookies = ctx.message.text.trim();

      await Settings.update(
        { cookie: cookies },
        { where: { id: 1 } }
      );

      await ctx.scene.reply("✅ Куки успешно сохранены!", {
        reply_markup: Markup.inlineKeyboard([]),
      });

      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при сохранении куков").catch(() => {});
      return ctx.scene.leave();
    }
  }
);

scene.leave(admin);

module.exports = scene;
