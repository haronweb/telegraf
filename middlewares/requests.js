const requests = require("../commands/requests");
const locale = require("../locale");
const { Referral, Request } = require("../database");
const menu2 = require("../commands/menu2");

module.exports = async (ctx, next) => {
  try {
  if (ctx.message && ctx.message.text && ctx.message.text.startsWith("/start")) {
  // Проверяем, что команда вызвана в группе или супергруппе
  if (ctx.chat.type !== "private") {
    // Удаляем сообщение пользователя
    // await ctx.deleteMessage();

    // Отправляем ответ на сообщение пользователя
    await ctx.replyWithHTML(
      `<b>⚠️ Команда /start доступна только в личной переписке с ботом.</b>`,
      { reply_to_message_id: ctx.message.message_id },
      // { reply_to_message_id: ctx.message.message_id }
    );
    return;
  }

      const parts = ctx.message.text.split(" ");
      const userId = ctx.from.id;
      const referrerId = parts.length > 1 ? Number(parts[1]) : null;

      if (referrerId && referrerId === userId) {
        // Пользователь не может использовать свою же реферальную ссылку
        await ctx.replyWithHTML(`<b>⚠️ Вы не можете использовать свою же реферальную ссылку!</b>`);
        return;
      }

      if (referrerId && referrerId !== userId) {
        // Обработка реферальной системы
        const existingReferral = await Referral.findOne({ where: { userId } });
        const existingRequest = await Request.findOne({ where: { userId } });

        if (!existingReferral && !existingRequest) {
          await Referral.create({ referrerId, userId, profitAmount: 0 });

          await ctx.replyWithHTML("<b>Спасибо за регистрацию по реферальной ссылке!</b>");
          try {
            await ctx.telegram.sendMessage(
              referrerId,
              `<b>🎉 Новый пользователь зарегистрировался по вашей реферальной ссылке!</b>`,
              { parse_mode: "HTML" }
            );
          } catch (err) {
            if (err.description?.includes("bot was blocked by the user")) {
              console.warn(`⚠️ Бот заблокирован пользователем ${referrerId}`);
            } else {
              console.error("Ошибка отправки сообщения рефереру:", err);
            }
          }
        } else if (existingReferral) {
          await ctx.replyWithHTML("<b>🚫 Вы уже зарегистрированы по реферальной ссылке.</b>");
        } else {
          await ctx.replyWithHTML("<b>🚫 Вы уже зарегистрированы в системе.</b>");
        }
      }

      // Проверка заявок пользователя
      const existingRequest = await Request.findOne({ where: { userId } });

      if (!existingRequest) {
        // Запуск логики подачи заявки
        return requests(ctx);
      }

      switch (existingRequest.status) {
        case 0:
          // Заявка на рассмотрении
          return ctx
          .reply(
            locale?.requests?.wait_request_process ||
              "⏳ Ожидайте рассмотрения вашей заявки.",
            { parse_mode: "HTML" }
          )
          .catch(console.error);        case 1:
          // Заявка одобрена, открываем меню
          await menu2(ctx);
          return;
        case 2:
          // Заявка отклонена, никаких действий
          return;
        default:
          // Непредвиденный статус
          return ctx.reply("❌ Неизвестный статус заявки.").catch(console.error);
      }
    }

    // Если остальная логика бота должна обрабатываться
    if (!ctx.state.bot.requestsEnabled) return next();

    if (ctx.state.user.status === 1 || ctx.state.user.status === 5) return next();

    const request = await ctx.state.user.getRequest();

    if (!request && ctx.chat?.id === ctx.from?.id) {
      return requests(ctx);
    }

    if (request?.status === 0 && ctx.chat?.id === ctx.from?.id) {
      return ctx
      .reply(
        locale?.requests?.wait_request_process ||
          "⏳ Ожидайте рассмотрения вашей заявки.",
        { parse_mode: "HTML" }
      )
      .catch(console.error);    } else if (request?.status === 1) {
      return next();
    }
  } catch (err) {
    console.error("Ошибка:", err);
    return ctx.reply("❌ Ошибка").catch(console.error);
  }
};
