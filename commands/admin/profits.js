const { Markup } = require("telegraf");
const { Profit } = require("../../database");
const locale = require("../../locale");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    const profits = await Profit.findAll({
      order: [["status", "asc"]],
    });

    const itemsPerPage = 45;
    const paginated = chunk(profits, itemsPerPage);
    const totalPages = paginated.length;

    const currentItems = paginated[currentPage - 1] || [];

    const profitButtonsFlat = currentItems.map((v) =>
      Markup.callbackButton(
        `${v.status === 0 ? "⏳" : v.status === 1 ? "✅" : v.status === 2 ? "🌎" : "❌"} ${v.amount} ${v.currency}`,
        `admin_profit_${v.id}`
      )
    );
    const profitButtons = chunk(profitButtonsFlat, 3);

    const pageButtons = totalPages > 1
      ? chunk(
          Array.from({ length: Math.min(totalPages, 30) }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `admin_profits_${i + 1}`
            )
          ),
          5
        )
      : [];

    const buttons = profitButtons.length > 0
      ? [...profitButtons, ...pageButtons]
      : [[Markup.callbackButton("Список пуст", "none")]];

    buttons.push([Markup.callbackButton(locale.go_back, "admin")]);

    return ctx.replyOrEdit(`💸 Список профитов (Всего: ${profits.length})`, {
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  } catch (err) {
    console.error("❌ Ошибка в admin_profits:", err);
    return ctx.reply("❌ Ошибка при загрузке профитов.");
  }
};
