const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { SupportChat } = require("../database");
const { wss } = require("../web/server");
const WebSocket = require("ws");
const downloadImage = require("../helpers/downloadImageTelegram");

const scene = new WizardScene(
  "scene_edit_support_message",

  async (ctx) => {
    if (!ctx.scene.state.editMessageId || !ctx.scene.state.adId) {
      await ctx.scene.reply("❌ Недостаточно данных для редактирования.");
      return ctx.scene.leave();
    }

    const supportMessage = await SupportChat.findByPk(
      ctx.scene.state.editMessageId
    );
    ctx.scene.state.replyToMessageId = supportMessage?.messageId || null;

  await ctx.scene.reply(`Введите сообщение. Можно использовать <b>HTML-теги</b>.
        
<b>Важно:</b> <i>обязательно закрывайте все HTML-теги, иначе форматирование не сработает!</i>
`, {
          
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });   
    return ctx.wizard.next();
  },

  async (ctx) => {
    try {
      const { editMessageId, adId, replyToMessageId } = ctx.scene.state;
      let newContent;

      if (ctx.message?.photo?.length > 0) {
        const fileId = ctx.message.photo.at(-1).file_id;
        const link = await downloadImage(fileId);

        if (!link) {
          await ctx.scene.reply("❌ Ошибка при загрузке изображения.").catch(() => {});
          return ctx.scene.leave();
        }

        newContent = link;
      } else if (ctx.message?.text?.trim()) {
        newContent = ctx.message.text.trim();
      } else {
        await ctx.scene.reply("⚠️ Отправьте текст или изображение.");
        return;
      }

      const result = await SupportChat.update(
        { message: newContent },
        { where: { id: editMessageId } }
      );

      if (result[0] === 0) {
        await ctx.scene.reply("<b>❌ Не удалось обновить сообщение.</b>", {
                    parse_mode:"HTML",

          reply_to_message_id: replyToMessageId,
        });
      } else {
        await ctx.scene.reply("<b>✅ Сообщение отредактировано!</b>", {
          parse_mode:"HTML",
          reply_to_message_id: replyToMessageId,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.adId == adId) {
            client.send(
              JSON.stringify({
                type: "edit_text",
                messageId: editMessageId,
                newText: newContent,
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("Ошибка при редактировании сообщения:", err);
      await ctx.scene.reply("❌ Ошибка при обновлении.");
    }

    return ctx.scene.leave();
  }
);

module.exports = scene;
