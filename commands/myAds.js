const { Markup } = require("telegraf");
const { Ad, Settings } = require("../database");
const locale = require("../locale");
const chunk = require("chunk");
const moment = require("moment");

module.exports = async (ctx, page = 1) => {
  try {
    if (ctx.state.bot?.work !== true) {
      return ctx
        .answerCbQuery("❌ STOP WORK, ожидайте рассылки!", true)
        .catch((err) => err);
    }

    const allAds = await Ad.findAll({
      where: { userId: ctx.from.id },
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
const itemsPerPage = 10;
const paginated = chunk(allAds, itemsPerPage);
const totalPages = paginated.length;

const currentItems = paginated[currentPage - 1] || [];

const adButtonsFlat = currentItems.map((v) =>
  Markup.callbackButton(
    `${v.service.title} | ${v.title || "Без названия"} | ${v.id}`,
    `my_ad_${v.id}`
  )
);
const adButtons = chunk(adButtonsFlat, 1); // по 1 на строку
let buttons = [...adButtons];

const pageButtons = totalPages > 1
  ? chunk(
      Array.from({ length: totalPages }, (_, i) =>
        Markup.callbackButton(
          i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
          `my_ads_${i + 1}`
        )
      ),
      5
    )
  : [];

const actionButtons = [];

if (buttons.length === 0) {
  buttons = [[Markup.callbackButton("Список пуст", "none")]];
} else {
  actionButtons.push(
    [Markup.callbackButton("🔍 Поиск объявления", "search_by_id")],
    [Markup.callbackButton("❌ Удалить все объявления", "delete_all_my_ads")]
  );
}

const setting = await Settings.findOne();
let warningText = "";

if (setting?.auto_clean_db) {
  const now = moment();
  const currentDay = now.date();
  let nextDay = Math.ceil(currentDay / 5) * 5;

  if (nextDay === currentDay && now.hour() >= 5) {
    nextDay += 5;
  }

  if (nextDay > now.daysInMonth()) {
    nextDay = 5;
    now.add(1, "month");
  }

  const nextClean = moment(
    `${now.format("YYYY-MM")}-${String(nextDay).padStart(2, "0")} 05:00`,
    "YYYY-MM-DD HH:mm"
  );

  const diff = moment.duration(nextClean.diff(moment()));
  const days = Math.floor(diff.asDays());
  const hours = diff.hours();
  const minutes = diff.minutes();

  warningText =
    `<blockquote><b>Внимание!</b> Включена автоочистка базы.\n` +
    `Следующая очистка через: <b>${days}д ${hours}ч ${minutes}м</b>\n\n</blockquote>`;
}



    await ctx.answerCbQuery("🙊 Уже открываю").catch(() => {});

   return ctx
  .replyOrEdit(
    `📂 Список ваших объявлений (Всего: ${allAds.length})\n\n${warningText}`,
    {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        ...buttons,
        ...actionButtons, // показать сразу после объявлений
        ...pageButtons,
        [Markup.callbackButton("◀️ Назад", "start")],
      ]),
    }
  );
  } catch (err) {
    console.error("❌ Ошибка в my_ads:", err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
