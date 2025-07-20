const WizardScene = require("telegraf/scenes/wizard");
const { Telegram, Markup } = require("telegraf");
const bot = new Telegram(process.env.BOT_TOKEN);

const scene = new WizardScene(
  "admin_sms",
  async (ctx) => {
    try {
      await ctx.replyOrEdit(
        `✍️ Опишите суть проблемы, с которой вы столкнулись.\n\nЕсли у вас есть фото — загрузите его через @imgbbbot и прикрепите ссылку на фото.`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "settings_cancel")]]),
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const username = ctx.from.username ? `@${ctx.from.username}` : `ID: <code>${ctx.from.id}</code>`;
      let messageText = `👤 Пользователь ${username} прислал сообщение:\n\n`;

      if (ctx.message.text) {
        messageText += ctx.message.text + "\n\n";
      }
      
      // Ищем в тексте ссылку на фото (например, с imgbb)
      const urlMatch = ctx.message.text ? ctx.message.text.match(/https?:\/\/\S+/gi) : null;
      if (urlMatch && urlMatch.length > 0) {
        messageText += `📷 Ссылка на фото: ${urlMatch[0]}\n\n`;
      }

      await bot.sendMessage(ctx.state.bot.supportChatId, messageText, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Ответить", `answer_worker_${ctx.from.id}`)],
        ]),
      });

      await ctx.reply(
        `<b>✅ Отчет успешно отправлен на просмотр администрации.</b>`,
        {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("◀️ В главное меню", `start`)]]),
        }
      );
      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
