const { Markup } = require("telegraf");
const { User, Profit } = require("../database");
const { Sequelize } = require("../models");
const moment = require("moment");

module.exports = async (ctx) => {
  try {
    const kassa = await Profit.sum("amount");

    // Запрос для топ-10 воркеров по общей прибыли
    const users = await User.findAll({
      subQuery: false,
      attributes: {
        include: [
          [
            Sequelize.fn("SUM", Sequelize.col("profits.amount")),
            "totalProfits",
          ],
        ],
      },
      include: [
        {
          association: "profits",
          attributes: [],
          required: true,
        },
      ],
      group: ["User.id"],
      order: [[Sequelize.literal("totalProfits"), "desc"]],
      limit: 10,
    });

    // Запрос для топ-3 воркеров за текущий месяц
    const monthStart = moment().startOf("month").toDate();
    const monthEnd = moment().endOf("month").toDate();

    const topMonthUsers = await User.findAll({
      subQuery: false,
      attributes: {
        include: [
          [
            Sequelize.fn("SUM", Sequelize.col("profits.amount")),
            "monthlyProfits",
          ],
        ],
      },
      include: [
        {
          association: "profits",
          attributes: [],
          required: true,
          where: {
            createdAt: {
              [Sequelize.Op.between]: [monthStart, monthEnd],
            },
          },
        },
      ],
      group: ["User.id"],
      order: [[Sequelize.literal("monthlyProfits"), "desc"]],
      limit: 3,
    });

    const top10Symbols = ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10."];
    const top3Medals = ["🥇", "🥈", "🥉"];

    // Формируем текст для топ-10 воркеров
    let text = users
      .map(
        (v, i) =>
          `${top10Symbols[i]} ${
            v.hideNick
              ? "Скрыт"
              : `#${v.tag == null ? "неизвестно" : v.tag}`
          } — <b>${parseFloat(v.getDataValue("totalProfits")).toFixed(2)} USD</b>`
      )
      .join("\n");

    if (users.length < 1) text = "В топе пусто, у тебя есть шанс стать первым";

    // Формируем текст для топ-3 воркеров за месяц с медалями
    let textMonth =
      topMonthUsers.length > 0
        ? topMonthUsers
            .map(
              (v, i) =>
                `${top3Medals[i]} ${
                  v.hideNick
                    ? "Скрыт"
                    : `#${v.tag == null ? "неизвестно" : v.tag}`
                } — <b>${parseFloat(v.getDataValue("monthlyProfits")).toFixed(2)} USD</b>`
            )
            .join("\n")
        : "За этот месяц пока нет лучших воркеров!";

    return ctx
      .replyOrEdit(
        `<b>🏆 Топ воркеров за все время</b>
     
${text}

<b>🔥 Топ 3 воркера за месяц</b>

${textMonth}

💰 Общая касса: <b>${parseFloat(kassa).toFixed(2)} USD</b>

`,
        {
          parse_mode: "HTML",
          disable_notification: true,
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("🚀 Касса", "kassa"),
              Markup.callbackButton("❌ Скрыть", "delete"),
            ],
          ]),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
