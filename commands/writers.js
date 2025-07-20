const { Markup } = require("telegraf");
const { Writer, Log, User, Profit } = require("../database");
const { Sequelize } = require("sequelize");
const moment = require("moment");

module.exports = async (ctx, with_buttons = true) => {
  try {
    const writers = await Writer.findAll({});

    // Топ 10 вбиверов за всё время
    const top10AllTime = await Profit.findAll({
      attributes: [
        "writerId",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalProfits"],
      ],
      where: {
        writerId: { [Sequelize.Op.ne]: null },
      },
      include: [
        {
          model: User,
          as: "writer",
          attributes: ["id", "username", "hideNick"],
        },
      ],
      group: ["writerId", "writer.id"],
      order: [[Sequelize.literal("totalProfits"), "DESC"]],
      limit: 10,
    });

    // Топ 3 вбивера за текущий месяц
    const monthStart = moment().startOf("month").toDate();
    const monthEnd = moment().endOf("month").toDate();

    const top3Month = await Profit.findAll({
      attributes: [
        "writerId",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "monthlyProfits"],
      ],
      where: {
        writerId: { [Sequelize.Op.ne]: null },
        createdAt: {
          [Sequelize.Op.between]: [monthStart, monthEnd],
        },
      },
      include: [
        {
          model: User,
          as: "writer",
          attributes: ["id", "username", "hideNick"],
        },
      ],
      group: ["writerId", "writer.id"],
      order: [[Sequelize.literal("monthlyProfits"), "DESC"]],
      limit: 3,
    });

    const topSymbols10 = ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10."];
    const topSymbols3 = ["🥇", "🥈", "🥉"];

   const topAllTimeText = top10AllTime
  .filter((v) => v.writer && v.writer.username && !/^\d/.test(v.writer.username))
  .map((v, i) => {
    const user = v.writer;
    const username = user.username ? `@${user.username}` : `ID:${user.id}`;
    const amount = parseFloat(v.getDataValue("totalProfits")).toFixed(2);
    return `${topSymbols10[i] || `${i + 1}.`} ${username} — <b>${amount} USD</b>`;
  })
  .join("\n") || "Пока нет данных.";

const topMonthText = top3Month
  .filter((v) => v.writer && v.writer.username && !/^\d/.test(v.writer.username))
  .map((v, i) => {
    const user = v.writer;
    const username = user.username ? `@${user.username}` : `ID:${user.id}`;
    const amount = parseFloat(v.getDataValue("monthlyProfits")).toFixed(2);
    return `${topSymbols3[i] || `${i + 1}.`} ${username} — <b>${amount} USD</b>`;
  })
  .join("\n") || "За этот месяц пока нет лучших вбиверов!";

    // Список активных воркеров
    let text = "<b>✍️ Вбиверы:</b>\n\n";

    if (writers.length > 0) {
      const writerData = await Promise.all(
        writers.map(async (writer) => {
          const user = await User.findOne({ where: { id: writer.userId } });

          if (!user || !user.username || /^\d/.test(user.username)) return null;

          const lastLog = await Log.findOne({
            where: { writerId: writer.userId },
            order: [["updatedAt", "DESC"]],
          });

          let lastActiveMinutes = null;

          if (lastLog) {
            const dateToUse = lastLog.updatedAt || lastLog.createdAt;
            lastActiveMinutes = moment().diff(moment(dateToUse), "minutes", true);
          }

          return { user, lastLog, lastActiveMinutes };
        })
      );

      const validWriters = writerData.filter(Boolean);

      validWriters.sort((a, b) => {
        if (a.lastActiveMinutes === null) return 1;
        if (b.lastActiveMinutes === null) return -1;
        return a.lastActiveMinutes - b.lastActiveMinutes;
      });

      const writersList = validWriters.map(({ user, lastLog, lastActiveMinutes }, index) => {
        const displayName =
          user.username && isNaN(user.username[0]) ? `@${user.username}` : `ID:${user.id}`;

        let statusText = `<i>ещё не обрабатывал лог(ов)</i>`;

        if (lastLog) {
          if (lastActiveMinutes < 60 * 24) {
            if (lastActiveMinutes < 1) {
              statusText = "<b>Обрабатывал лог меньше минуты назад</b>";
            } else if (lastActiveMinutes < 60) {
              statusText = `<b>Обрабатывал лог ${lastActiveMinutes.toFixed(1)} минут назад</b>`;
            } else {
              const hours = lastActiveMinutes / 60;
              statusText = `<b>Обрабатывал лог ${hours.toFixed(1)} часов назад</b>`;
            }
          } else {
            const dateToUse = lastLog.updatedAt || lastLog.createdAt;
            statusText = `<b>Обрабатывал лог ${moment(dateToUse).format("DD.MM.YYYY HH:mm")}</b>`;
          }
        }

        return `${index + 1}. ${displayName} — ${statusText}`;
      });

      text += writersList.join("\n");
    } else {
      text = "<b>😴 На вбиве никого</b>";
    }

    // Добавляем топы
    text += `

<b>🏆 Топ вбиверов за всё время</b>

${topAllTimeText}

<b>🔥 Топ 3 вбивера за месяц</b>

${topMonthText}
`;

    return ctx.replyOrEdit(text, {
      parse_mode: "HTML",
      disable_notification: true,
      disable_web_page_preview: true,
      reply_markup:
        ctx.updateType === "callback_query"
          ? Markup.inlineKeyboard([[Markup.callbackButton("◀️ Назад", "info")]])
          : Markup.inlineKeyboard([[Markup.callbackButton("❌ Скрыть", "delete")]]),
    });
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Произошла ошибка").catch((err) => console.log(err));
  }
};
