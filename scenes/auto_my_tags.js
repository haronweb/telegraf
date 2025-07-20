const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { User } = require("../database");
const log = require("../helpers/log");

const scene = new WizardScene(
  "auto_my_tags",
  async (ctx) => {
    try {
      // Генерация тега от 5 до 10 символов
      const generateTag = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        const length = Math.floor(Math.random() * 6) + 5; // от 5 до 10
        let tag = "";
        for (let i = 0; i < length; i++) {
          tag += chars[Math.floor(Math.random() * chars.length)];
        }
        return tag;
      };

      const tag = generateTag();

      // Сохраняем тег
      await User.update({ tag }, { where: { id: ctx.from.id } });

      await ctx.replyOrEdit(
        `✅ Тег сгенерирован <b>#${tag}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", `settings_my_tags`)],
          ]),
        }
      );

      log(ctx, `Сгенерировал себе тег #${tag}`);
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
