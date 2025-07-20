const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Operators } = require("../../database");

const scene = new WizardScene(
  "admin_editAbout1",
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch((err) => err);
      await ctx.scene.reply("Введите описание оператору", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const operator = await Operators.findOne({
        where: {
          id: ctx.scene.state.mentorId,
        },
      });
      await operator.update({
        about: ctx.message.text,
      });
      await ctx.scene.reply("✅ Описание оператора успешно изменено", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "👨🏼‍💻 К оператору",
              `admin_operator_${ctx.scene.state.mentorId}`
            ),
          ],
        ]),
      });
    } catch (err) {
      console.log(err);
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

module.exports = scene;
