const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { User } = require("../database");




module.exports = new WizardScene(
  "change_tag",
  async (ctx) => {
    try {
      await ctx.scene.reply(
          `<b>Введите TAG, который хотите установить</b>

<i>Внимание: данный тэг будет отображаться не только в настройках, но и в выплатах</i>

<i>Пожалуйста, вводите тэг без решетки, это очень важно</i>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("◀️ Назад", "money_cancel")],
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
      ctx.wizard.state.new_tag = ctx.message.text;
      await User.update(
        { tag: ctx.wizard.state.new_tag },
        { where: { id: ctx.from.id } }
      );
      await ctx
        .scene.reply(
          `🎉 Поздравляем, вы успешно установили тэг <b>#${ctx.wizard.state.new_tag}</b>`,
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("◀️ Назад", "start")],
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

