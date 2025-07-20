const { Markup } = require("telegraf");
const { Profit, User } = require("../../database");
const locale = require("../../locale");
const chunk = require("chunk");

module.exports = async (ctx, userId, page = 1) => {
  try {
    const currentPage = parseInt(page);
    const user = await User.findByPk(userId);
    const profits = await Profit.findAll({
      where: { userId },
      order: [["createdAt", "desc"]],
    });

    const itemsPerPage = 45;
    const paginated = chunk(profits, itemsPerPage);
    const totalPages = paginated.length;

    const currentItems = paginated[currentPage - 1] || [];

    const profitButtonsFlat = currentItems.map((v) =>
      Markup.callbackButton(
        `${v.amount} ${v.currency} | ${v.serviceTitle}`,
        `admin_user_${userId}_profit_${v.id}`
      )
    );
    const profitButtons = chunk(profitButtonsFlat, 3);

    const pageButtons = totalPages > 1
      ? chunk(
          Array.from({ length: totalPages }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `admin_user_${userId}_profits_${i + 1}`
            )
          ),
          5
        )
      : [];

    const buttons = [
      [Markup.callbackButton("💸 Добавить профит", `admin_user_${user.id}_add_profit`)],
      ...(profitButtons.length > 0 ? [...profitButtons, ...pageButtons] : [[Markup.callbackButton("Список пуст", "none")]]),
      [Markup.callbackButton(locale.go_back, `admin_user_${user.id}`)],
    ];

    const keyboard = Markup.inlineKeyboard(buttons);

    const text = `💰 Список профитов пользователя <b><a href="tg://user?id=${user.id}">${user.username}</a></b> (Всего: ${profits.length})`;

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
      return ctx.replyOrEdit(text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      }).catch(() => {});
    }
  } catch (err) {
    console.error("❌ Ошибка в admin_user_profits:", err);
    return ctx.reply("❌ Ошибка при загрузке профитов.").catch(() => {});
  }
};
