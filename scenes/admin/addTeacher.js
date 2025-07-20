const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { User, Nastavniki, } = require("../../database");
const log = require("../../helpers/log");



const scene = new WizardScene(
  "admin_add_teacher",
  async (ctx) => {
    try {
      if (ctx.state.user.status == 1)

        await ctx.scene.reply("Введите username наставника (Формат: @username)", {
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
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      ctx.message.text = ctx.message.text.replace("@", "");
      const user = await User.findOne({
        where: {
        

          username: ctx.message.text,
  
        },
      });



     

      const mentor = await User.findOne({ where: { id: id } });

      if (!user) {
        await ctx.reply("❌ Пользователь не найден в боте").catch((err) => err);
        return ctx.wizard.prevStep();
      }


    

      await user.update({
        username: user.username,
        status: 5,
      })


      await Nastavniki.create({
        id:User.id,
        username: user.username,
        status: 1,
        }



      );


      log(ctx, `добавил наставника <b><a href="tg://user?id=${user.id}">${user.username}</a></b>`);
      await ctx.scene.reply("✅ Наставник добавлен!").catch((err) => err);
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      console.log(err)
    }
    return ctx.scene.leave();
  }
);

module.exports = scene;
