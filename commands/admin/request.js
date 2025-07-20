const { Markup } = require("telegraf");
const { Request, User } = require("../../database");
const locale = require("../../locale");

// Главная функция для показа заявки
module.exports = async (ctx, id, userId = null) => {
  try {
    let request = await Request.findOne({
      where: { id },
      include: [{ association: "user", required: false }],
    });

    if (!request) {
      return ctx.replyOrEdit("❌ Заявка не найдена", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", userId ? `admin_user_${userId}` : `admin_requests_1`)],
        ]),
      });
    }

    if (ctx.state.user.status === 2) {
      return ctx.answerCbQuery("❌ У вас нет прав для выполнения этой команды.", true);
    }

    const statusText = {
      0: "⏳ На рассмотрении",
      1: "✅ Принята",
      2: "❌ Отклонена",
    }[request.status] || "Неизвестно";

    const userInfo = request.user
      ? `<b><a href="tg://user?id=${request.user.id}">${request.user.username || request.user.id}</a></b> | <code>${request.user.id}</code>`
      : `<b>Пользователь удалён</b>`;

    const photoInfo = `📌 Скриншот с профитами: <b>${request.photo ? "прикреплен" : "не прикреплен"}</b>`;

    const messageText = `<b>📝 Заявка #${request.id}</b>

👤 Пользователь: ${userInfo}

📌 ${locale.requests.steps[0].request_text}: <b>${request.step1}</b>
📌 ${locale.requests.steps[1].request_text}: <b>${request.step2}</b>
📌 ${locale.requests.steps[2].request_text}: <b>${request.step3}</b>

${photoInfo}

🚦 Статус заявки: <b>${statusText}</b>`;

    const buttons = [
      [
        Markup.callbackButton(`✅ Принять`, `admin_${userId ? `user_${userId}_` : ``}request_${request.id}_accept`),
        Markup.callbackButton(`❌ Отклонить`, `admin_${userId ? `user_${userId}_` : ``}request_${request.id}_decline`),
      ],
      [Markup.callbackButton("◀️ Назад", userId ? `admin_user_${userId}` : `admin_requests_1`)],
    ];

    const replyMarkup = Markup.inlineKeyboard(buttons);

    // Проверяем, фото или текст
    try {
      if (request.photo) {
        const message = ctx.update.callback_query.message;
        const hasMedia = message?.photo || message?.video;

        if (hasMedia) {
          await ctx.editMessageMedia(
            { type: "photo", media: request.photo, caption: messageText, parse_mode: "HTML" },
            { reply_markup: replyMarkup }
          );
        } else {
          await ctx.deleteMessage().catch((err) => err);

          await ctx.replyWithPhoto(request.photo, { caption: messageText, parse_mode: "HTML", reply_markup: replyMarkup });
        }
      } else {
        await ctx.editMessageText(messageText, { parse_mode: "HTML", reply_markup: replyMarkup });
      }
    } catch (editErr) {
      if (editErr.description && editErr.description.includes('message is not modified')) {
        console.log("Сообщение уже актуально, пропускаем ошибку.");
      } else {
        console.error("Ошибка при редактировании:", editErr.message);
      }
    }

  } catch (err) {
    console.error("Ошибка:", err);
    return ctx.reply("❌ Ошибка");
  }
};
