const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Profiles } = require("../database");


const scene = new WizardScene(
  "change_title",
  async (ctx) => {
    try {
      await ctx.answerCbQuery("Ожидаю название... ").catch((err) => err);

      await ctx.replyOrEdit("Введите новое название", {
        parse_mode:"HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", `profiles_cancel`)],
        ]),
      });
      ctx.wizard.state.profileId = ctx.match[1]
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      // await Profiles.update(
      //   {
      //     address: ctx.message.text,
      //   },
      //   { where: { userId: ctx.from.id  } }
      // );

      await Profiles.update({
        title: ctx.message.text
      }, {
        where: {
          id: ctx.wizard.state.profileId
        }
      })
      await ctx.reply(`✅ Название изменено`, {
        reply_to_message_id: ctx.message.message_id,

        parse_mode:"HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton('◀️ Назад', `profile_${ctx.wizard.state.profileId}`)],
        ]),
      });
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx
        .replyWithHTML(`<b>❌ Ошибка</b> `)
        .catch((err) => err);
        console.log(err)
      return ctx.scene.leave();
      
    }
    
  },
)



module.exports = scene;
