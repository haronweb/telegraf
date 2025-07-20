const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Nastavniki } = require("../../database");

const scene = new WizardScene(
  "admin_editMentorPercent",
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch((err) => err);
      await ctx.scene.reply("Введите новый процент наставнику", {
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
      const mentor = await Nastavniki.findOne({
        where: {
          id: ctx.scene.state.mentorId,
        },
      });
      await mentor.update({
        percent: parseInt(ctx.message.text),
      });
      await ctx.scene.reply("✅ Процент наставнику успешно изменено", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "🎓 К наставнику",
              `admin_mentor_${ctx.scene.state.mentorId}`
            ),
          ],
        ]),
      });
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

module.exports = scene;
