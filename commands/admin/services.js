const { Markup } = require("telegraf");
const { Service } = require("../../database");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    const services = await Service.findAll({ order: [["title", "asc"]] });

    const itemsPerPage = 25;
    const paginated = chunk(services, itemsPerPage);
    const totalPages = paginated.length;
    const currentItems = paginated[currentPage - 1] || [];

    const serviceButtonsFlat = currentItems.map((s) =>
      Markup.callbackButton(s.title, `admin_service_${s.id}`)
    );
    const serviceButtons = chunk(serviceButtonsFlat, 3);

    const pageNavButtons = totalPages > 1
      ? chunk(
          Array.from({ length: totalPages }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `admin_services_${i + 1}`
            )
          ),
          5
        )
      : [];

    const buttons = serviceButtons.length > 0
      ? [...serviceButtons, ...pageNavButtons]
      : [[Markup.callbackButton("Список пуст", "none")]];

    buttons.push([Markup.callbackButton("◀️ Назад", "admin")]);

    return ctx.replyOrEdit(`📦 Список сервисов (Всего: ${services.length})`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  } catch (err) {
    console.error("❌ Ошибка:", err);
    return ctx.reply("❌ Ошибка при загрузке сервисов.");
  }
};
