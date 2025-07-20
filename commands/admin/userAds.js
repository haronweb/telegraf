const { Markup } = require("telegraf");
const { Ad, User } = require("../../database");
const locale = require("../../locale");
const chunk = require("chunk");

module.exports = async (ctx, userId, page = 1) => {
  try {
    const user = await User.findByPk(userId);

    if (ctx.state.user?.status === 2) {
      return ctx.answerCbQuery("❌ Доступ вбиверу сюда закрыт", true).catch(() => {});
    }

    const allAds = await Ad.findAll({
      where: { userId },
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

    const currentPage = parseInt(page);
    const itemsPerPage = 45;
    const paginated = chunk(allAds, itemsPerPage);
    const totalPages = paginated.length;

    const currentItems = paginated[currentPage - 1] || [];

    const adButtonsFlat = currentItems.map((v) =>
      Markup.callbackButton(
        `${v.service.title} ${v.version}.0 | ${v.title || "Без названия"}`,
        `admin_user_${user.id}_ad_${v.id}`
      )
    );
    const adButtons = chunk(adButtonsFlat, 3);

    const pageButtons = totalPages > 1
      ? chunk(
          Array.from({ length: totalPages }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `admin_user_${user.id}_ads_${i + 1}`
            )
          ),
          5
        )
      : [];

    const buttons = adButtons.length > 0
      ? [...adButtons, ...pageButtons]
      : [[Markup.callbackButton("Список пуст", "none")]];

    buttons.push([Markup.callbackButton(locale.go_back, `admin_user_${user.id}`)]);

    const keyboard = Markup.inlineKeyboard(buttons);

    const text = `📦 Список объявлений пользователя <b><a href="tg://user?id=${user.id}">${user.username}</a></b> (Всего: ${allAds.length})`;

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
      });
    }
  } catch (err) {
    console.error("❌ Ошибка в admin_user_ads:", err);
    return ctx.reply("❌ Ошибка при загрузке объявлений.").catch(() => {});
  }
};
