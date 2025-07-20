const { Markup } = require("telegraf");
const { Country } = require("../../database");
const locale = require("../../locale");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    const countries = await Country.findAll({ order: [["title", "asc"]] });

    const itemsPerPage = 25;
    const paginated = chunk(countries, itemsPerPage);
    const totalPages = paginated.length;
    const currentItems = paginated[currentPage - 1] || [];

    const countryButtonsFlat = currentItems.map((c) =>
      Markup.callbackButton(c.title, `admin_country_${c.id}`)
    );
    const countryButtons = chunk(countryButtonsFlat, 3);

    const pageButtons = totalPages > 1
      ? chunk(
          Array.from({ length: totalPages }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `admin_countries_${i + 1}`
            )
          ),
          5
        )
      : [];

    const buttons = countryButtons.length > 0
      ? [...countryButtons, ...pageButtons]
      : [[Markup.callbackButton("Список пуст", "none")]];

    buttons.push([Markup.callbackButton(locale.go_back, "admin")]);

    return ctx.replyOrEdit(`🌎 Список стран (Всего: ${countries.length})`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard(buttons),
    });
  } catch (err) {
    console.error("❌ Ошибка в admin_countries:", err);
    return ctx.reply("❌ Ошибка при загрузке стран.");
  }
};
