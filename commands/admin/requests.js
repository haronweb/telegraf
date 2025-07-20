const { Markup } = require("telegraf");
const { Request } = require("../../database");
const locale = require("../../locale");
const chunk = require("chunk");
const getRequestStatus = require("../../helpers/getRequestStatus");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    const requests = await Request.findAll({
      order: [["status", "asc"]],
    });

    const itemsPerPage = 45;
    const paginated = chunk(requests, itemsPerPage);
    const totalPages = paginated.length;

    const currentItems = paginated[currentPage - 1] || [];

    // Кнопки заявок
    const requestButtonsFlat = currentItems.map((v) =>
      Markup.callbackButton(
        `${getRequestStatus(v.status)} #${v.id}`,
        `admin_request_${v.id}`
      )
    );
    const requestButtons = chunk(requestButtonsFlat, 3);

    // Страницы
    const maxPageButtons = 30;
    const pageButtons = chunk(
      Array.from({ length: Math.min(totalPages, maxPageButtons) }, (_, i) =>
        Markup.callbackButton(
          i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
          `admin_requests_${i + 1}`
        )
      ),
      5
    );

    // Итоговая клавиатура
    const buttons = requestButtons.length > 0
      ? [...requestButtons, ...pageButtons]
      : [[Markup.callbackButton("Список пуст", "none")]];

    buttons.push([Markup.callbackButton(locale.go_back, "admin")]);

    const keyboard = Markup.inlineKeyboard(buttons);
    const text = `📝 Список заявок (Всего: ${requests.length})`;

    const message = ctx.update?.callback_query?.message;
    const hasMedia =
      message?.photo || message?.video || message?.document || message?.animation;

    if (hasMedia) {
      await ctx.deleteMessage().catch(() => {});
      return ctx.reply(text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    } else {
      return ctx
        .replyOrEdit(text, {
          parse_mode: "HTML",
          reply_markup: keyboard,
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error("❌ Ошибка в admin_requests:", err);
    return ctx.reply("❌ Ошибка при загрузке заявок.").catch(() => {});
  }
};
