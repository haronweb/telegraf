const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { SupportTemp } = require("../database");
const downloadImage = require("../helpers/downloadImageChat");

const scene = new WizardScene(
  "change_text_temp",
  async (ctx) => {
    try {
      await ctx.answerCbQuery("Ожидаю название... ").catch((err) => err);

      await ctx.replyOrEdit("Введите новый текст или отправьте изображение", {
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
      if (ctx.message.text) {
        ctx.wizard.state.text = ctx.message.text;

        await SupportTemp.update(
          {
            photo: null,
          },
          {
            where: {
              id: ctx.wizard.state.tempId,
            },
          }
        );
      } else if (ctx.message.photo) {
        await SupportTemp.update(
          {
            text: null,
          },
          {
            where: {
              id: ctx.wizard.state.tempId,
            },
          }
        );
        const photo_link = await ctx.telegram.getFileLink(
          ctx.message.photo[ctx.message.photo.length - 1].file_id
        );
        ctx.wizard.state.photo = await downloadImage(photo_link);
      }
      await SupportTemp.update(
        {
          text: ctx.wizard.state.text,
          photo: ctx.wizard.state.photo,
        },
        {
          where: {
            id: ctx.wizard.state.tempId,
          },
        }
      );
      await ctx.reply(`<b>✅ Шаблон успешно обновлен!</b>`, {
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
