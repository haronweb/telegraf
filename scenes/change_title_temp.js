const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { SupportTemp } = require("../database");

const scene = new WizardScene(
  "change_title_temp",
  async (ctx) => {
    try {
      await ctx.answerCbQuery("Ожидаю название... ").catch((err) => err);

      await ctx.replyOrEdit("Введите новое название", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "supportTemp_cancel")],
        ]),
      });
      ctx.wizard.state.tempId = ctx.match[1];
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

      await SupportTemp.update(
        {
          title: ctx.message.text,
        },
        {
          where: {
            id: ctx.wizard.state.tempId,
          },
        }
      );
      await ctx.reply(`<b>Данные успешно сохранены!</b>`, {
        reply_to_message_id: ctx.message.message_id,

        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "◀️ Назад",
              `temp_${ctx.wizard.state.tempId}`
            ),
          ],
        ]),
      });
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.replyWithHTML(`<b>❌ Ошибка</b> `).catch((err) => err);
      console.log(err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
