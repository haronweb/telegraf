const WizardScene = require("telegraf/scenes/wizard");

const { Telegram, Markup } = require("telegraf");

const { User } = require("../database");

const bot = new Telegram(process.env.BOT_TOKEN);

const scene = new WizardScene(
  "answer_worker",
  async (ctx) => {
    try {
      const userId = ctx.match[1];

      ctx.scene.state.userId = userId;

      // await ctx.answerCbQuery("Ожидаю кошелек... ").catch((err) => err);

      await ctx.reply(`Введите ответ..`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
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
      await bot.sendMessage(
        ctx.scene.state.userId,
        `<b>💬 Сообщение от администрации:</b>
      `,
        {
          parse_mode: "HTML",
          // reply_markup: Markup.inlineKeyboard([
          //   [Markup.callbackButton("💬 Ответить", `answer_worker`)],
          // ]),
        }
      );
      await bot.sendCopy(ctx.scene.state.userId, ctx.message, {
        parse_mode: "HTML",
      });

      await ctx.reply(`✅ Сообщение успешно отправлено.`, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "HTML",
        // Оставьте reply_markup, если вам нужны дополнительные кнопки
      });

      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
