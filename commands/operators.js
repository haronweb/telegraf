const { Markup } = require("telegraf");
const { Operators, Log, User, Profit } = require("../database");
const { Sequelize, Op } = require("sequelize");
const moment = require("moment");

module.exports = async (ctx, with_buttons = true) => {
  try {
    const operators = await Operators.findAll();

    let text = "<b>👨🏼‍💻 Операторы:</b>\n";

    if (operators.length > 0) {
      const validOperators = [];

      for (const operator of operators) {
        const user = await User.findOne({ where: { id: operator.userId } });

        if (!user || !user.username || /^\d/.test(user.username)) continue;

        validOperators.push({
          username: user.username,
          status: operator.work ? "🟢" : "🔴",
          work: operator.work,
        });
      }

      validOperators.sort((a, b) => (a.work === b.work ? 0 : a.work ? -1 : 1));

      if (validOperators.length > 0) {
        validOperators.forEach((op, i) => {
          text += `\n${i + 1}. @${op.username} ${op.status}`;
        });
      } else {
        text += `\nНет валидных операторов.`;
      }

      // Топ 10 операторов за всё время
      const top10AllTime = await Profit.findAll({
        attributes: [
          "operator",
          [Sequelize.fn("SUM", Sequelize.col("amount")), "totalProfit"],
        ],
        where: {
          operator: { [Op.ne]: null },
        },
        group: ["operator"],
        order: [[Sequelize.literal("totalProfit"), "DESC"]],
        limit: 10,
      });

      text += `\n\n<b>🏆 Топ операторов за всё время</b>\n`;

      let rank = 1;
      for (const op of top10AllTime) {
        const user = await User.findOne({ where: { id: op.operator } });
        if (!user || !user.username || /^\d/.test(user.username)) continue;

        const profit = parseFloat(op.getDataValue("totalProfit")).toFixed(2);
        text += `\n${rank}. @${user.username} — <b>${profit} USD</b>`;
        rank++;
      }
      if (rank === 1) {
        text += "\nПока нет данных по топу операторов.";
      }

      // Топ 3 операторов за месяц с эмодзи
      const monthStart = moment().startOf("month").toDate();
      const monthEnd = moment().endOf("month").toDate();

      const top3Month = await Profit.findAll({
        attributes: [
          "operator",
          [Sequelize.fn("SUM", Sequelize.col("amount")), "monthlyProfit"],
        ],
        where: {
          operator: { [Op.ne]: null },
          createdAt: { [Op.between]: [monthStart, monthEnd] },
        },
        group: ["operator"],
        order: [[Sequelize.literal("monthlyProfit"), "DESC"]],
        limit: 3,
      });

      const topSymbols3 = ["🥇", "🥈", "🥉"];

      text += `\n\n<b>🔥 Топ 3 операторов за месяц</b>\n`;

      rank = 1;
      for (const op of top3Month) {
        const user = await User.findOne({ where: { id: op.operator } });
        if (!user || !user.username || /^\d/.test(user.username)) continue;

        const profit = parseFloat(op.getDataValue("monthlyProfit")).toFixed(2);
        text += `\n${topSymbols3[rank - 1] || `${rank}.`} @${user.username} — <b>${profit} USD</b>`;
        rank++;
      }
      if (rank === 1) {
        text += "\nВ этом месяце пока нет лучших операторов.";
      }
    } else {
      text += "\nНет операторов.";
    }

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
    console.error(err);
    return ctx.reply("❌ Произошла ошибка").catch((e) => console.error(e));
  }
};
