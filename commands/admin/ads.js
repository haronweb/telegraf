const { Markup } = require("telegraf");
const { Ad } = require("../../database");
const locale = require("../../locale");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    const ads = await Ad.findAll({
      order: [["createdAt", "desc"]],
      include: [
        {
          association: "service",
          required: true,
          include: [
            {
              association: "country",
              required: true,
            },
          ],
        },
      ],
    });

    const itemsPerPage = 45;
    const paginated = chunk(ads, itemsPerPage);
    const totalPages = paginated.length;
    const currentItems = paginated[currentPage - 1] || [];

    const adButtonsFlat = currentItems.map((v) =>
      Markup.callbackButton(
        `${v.service.title} | ${v.title == null ? "Без названия" : v.title} | ${v.id}`,
        `admin_ad_${v.id}`
      )
    );

    const adButtons = chunk(adButtonsFlat, 3);

    const maxPageButtons = 30;
    const pageButtons = chunk(
      Array.from({ length: Math.min(totalPages, maxPageButtons) }, (_, i) =>
        Markup.callbackButton(
          i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
          `admin_ads_${i + 1}`
        )
      ),
      5
    );

    // 👇 Формируем финальный список кнопок
    const buttons = adButtons.length > 0 ? [...adButtons] : [[Markup.callbackButton("Список пуст", "none")]];

    const actionButtons = [];

    if (ads.length > 0) {
      actionButtons.push([Markup.callbackButton("❌ Удалить все объявления", "delete_admin_ads")]);
    }

    actionButtons.push([Markup.callbackButton(locale.go_back, "admin")]);

    return ctx.replyOrEdit(`📂 Список объявлений (Всего: ${ads.length})`, {
      reply_markup: Markup.inlineKeyboard([
        ...buttons,
        ...pageButtons,
        ...actionButtons,
      ]),
    });
  } catch (err) {
    console.error("❌ Ошибка в admin_ads:", err);
    return ctx.reply("❌ Ошибка при загрузке объявлений.");
  }
};
