const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Ad } = require("../database");
const { Op } = require("sequelize");

const deleteAdScene = new WizardScene(
  "delete_ad",
  async (ctx) => {
    try {
      // Отправка сообщения с запросом ID или ссылки
      const message = await ctx.replyOrEdit("Пожалуйста, отправьте ID, сокращённую ссылку или ссылку с личным доменом для поиска объявления, которое вы хотите удалить.", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([ 
          [Markup.callbackButton("Отменить", "cancel")]
        ]),
      });
      ctx.wizard.state.message_id = message.message_id; // Сохраняем ID сообщения для дальнейшего удаления
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      const input = ctx.message.text.trim();
      ctx.wizard.state.input = input;

      // Убираем # и пробелы, если есть
      const cleanedInput = input.toLowerCase().replace(/[#\s]/g, "").replace(/^id/, "");

      // Поиск объявления по ID или ссылке
      let ad;
      if (/^\d+$/.test(cleanedInput)) {
        // Ищем по ID
        ad = await Ad.findOne({
          where: {
            id: parseInt(cleanedInput),
            userId: ctx.from.id,
          },
        });
      } else {
        // Ищем по shortLink или myDomainLink
        ad = await Ad.findOne({
          where: {
            userId: ctx.from.id,
            [Op.or]: [
              { shortLink: cleanedInput },
              { myDomainLink: cleanedInput },
            ],
          },
        });
      }

      if (!ad) {
       
        return ctx.wizard.prevStep();
      }

      ctx.wizard.state.ad = ad;
      const confirmationMessage = await ctx.reply(`Вы действительно хотите удалить объявление с ID ${ad.id}?`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Подтвердить", "confirm_delete")],
          [Markup.callbackButton("Отменить", "cancel")]
        ]),
      });

      ctx.wizard.state.confirmationMessageId = confirmationMessage.message_id; // Сохраняем ID сообщения подтверждения
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка при поиске объявления.").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      const { ad } = ctx.wizard.state;
      if (ad) {
        await ad.destroy();
        await ctx.replyOrEdit("✅ Объявление успешно удалено.");
        await ctx.deleteMessage(ctx.wizard.state.message_id); // Удаляем начальное сообщение
        await ctx.deleteMessage(ctx.wizard.state.confirmationMessageId); // Удаляем сообщение с подтверждением
      } else {
        await ctx.replyOrEdit("❌ Ошибка: Объявление не найдено.");
        await ctx.deleteMessage(ctx.wizard.state.message_id); // Удаляем начальное сообщение
        await ctx.deleteMessage(ctx.wizard.state.confirmationMessageId); // Удаляем сообщение с подтверждением
      }
      return ctx.scene.leave();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

// Обработчик отмены
deleteAdScene.action('cancel', async (ctx) => {
  await ctx.deleteMessage(ctx.wizard.state.message_id); // Удаляем сообщение отмены
  await ctx.deleteMessage(ctx.wizard.state.confirmationMessageId); // Удаляем сообщение с подтверждением
  await ctx.reply('❌ Операция отменена.');
  return ctx.scene.leave();
});

// Обработчик подтверждения удаления
deleteAdScene.action('confirm_delete', async (ctx) => {
  const state = ctx.wizard.state;
  if (state && state.ad) {
    await state.ad.destroy();
    await ctx.answerCbQuery('✅ Объявление успешно удалено.');
    await ctx.deleteMessage(ctx.wizard.state.message_id); // Удаляем сообщение отмены
    await ctx.deleteMessage(ctx.wizard.state.confirmationMessageId); // Удаляем сообщение с подтверждением
  } else {
    await ctx.replyOrEdit('❌ Ошибка: Объявление не найдено.');
    await ctx.deleteMessage(ctx.wizard.state.message_id); // Удаляем сообщение отмены
    await ctx.deleteMessage(ctx.wizard.state.confirmationMessageId); // Удаляем сообщение с подтверждением
  }
  return ctx.scene.leave();
});

module.exports = deleteAdScene;
