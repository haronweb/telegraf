const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { User } = require("../database");

const scene = new WizardScene(
  "select_smartsupp",
  async (ctx) => {
    try {
      await ctx
        .replyOrEdit(
          "Введите API-Ключ от smartsupp, который хотите установить.",
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "money_cancel")],
            ]),
          }
        )
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      await User.update(
        {
          smartsupp: ctx.message.text,
        },
        {
          where: {
            id: ctx.from.id,
          },
        }
      );

      await ctx
        .replyOrEdit(`<b>✅ Токен успешно установлен</b>`, {
          reply_to_message_id: ctx.message.message_id,

          parse_mode: "HTML",

          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", `format_tp`)],
          ]),
        })
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
