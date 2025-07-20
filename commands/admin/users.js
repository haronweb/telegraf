const { Markup } = require("telegraf");
const { User } = require("../../database");
const locale = require("../../locale");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    const users = await User.findAll({
      order: [["createdAt", "desc"]],
    });

    const itemsPerPage = 45;
    const paginated = chunk(users, itemsPerPage);
    const totalPages = paginated.length;

    const currentItems = paginated[currentPage - 1] || [];

    const userButtonsFlat = currentItems.map((v) =>
      Markup.callbackButton(
        `${v.username ? `@${v.username}` : `ID: ${v.id}`}`,
        `admin_user_${v.id}`
      )
    );
    const userButtons = chunk(userButtonsFlat, 3);

    const pageButtons = totalPages > 1
      ? chunk(
          Array.from({ length: Math.min(totalPages, 30) }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `admin_users_${i + 1}`
            )
          ),
          5
        )
      : [];

    const buttons = userButtons.length > 0
      ? [...userButtons, ...pageButtons]
      : [[Markup.callbackButton("Список пуст", "none")]];

    buttons.push([Markup.callbackButton(locale.go_back, "admin")]);

    return ctx.replyOrEdit(`👥 Список пользователей (Всего: ${users.length})`, {
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  } catch (err) {
    console.error("❌ Ошибка в admin_users:", err);
    return ctx.reply("❌ Ошибка при загрузке пользователей.");
  }
};
