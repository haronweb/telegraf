const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const { Ad, Profit, Currency, User, Nastavniki, Operators } = require("../../database");
const locale = require("../../locale");

module.exports = async (ctx, id, userId = null) => {
  try {
    const currency = await Currency.findOne({ where: { code: "USD" } });
    const profit = await Profit.findByPk(id, {
      include: [
        { association: "writer", required: true },
        { association: "user", required: true },
      ],
    });

    if (!profit) {
      return ctx.replyOrEdit("❌ Профит не найден", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", userId ? `admin_user_${userId}_profits_1` : `admin_profits_1`)],
        ]),
      }).catch((err) => err);
    }

    const mentor = profit.mentor ? await Nastavniki.findOne({ where: { id: profit.mentor } }) : null;
    const operator = profit.operator ? await Operators.findOne({ where: { userId: profit.operator } }) : null;
    const ad = profit.adId ? await Ad.findOne({ where: { id: profit.adId } }) : null;

    const profitStatus = {
      0: "В процессе выплаты",
      1: "ВЫПЛАЧЕНО",
      2: "На развитие",
      3: "ЛОК",
    };

    const mentorInfo = mentor
      ? `<b>@${mentor.username} (${mentor.percent}%)</b>`
      : "<b>Отсутствует</b>";
    const operatorInfo = operator
      ? `<b>@${operator.username} (${operator.percent}%)</b>`
      : "<b>Отсутствует</b>";

    const text = `<b>💰 Профит ${escapeHTML(profit.serviceTitle)}</b>

🆔 ID: <code>${profit.id}</code>
💸 Сумма: <b>${profit.amount} ${profit.currency} / ${profit.convertedAmount} RUB</b>
💴 Процент воркера: <b>${profit.workerAmount} / ${(profit.workerAmount * currency.rub).toFixed(2)} RUB</b>
🚦 Статус: <b>${profitStatus[profit.status]}</b>

👤 Воркер: <b><a href="tg://user?id=${profit.user.id}">${escapeHTML(profit.user.username)}</a></b>
✍️ Вбивер: <b><a href="tg://user?id=${profit.writer.id}">${escapeHTML(profit.writer.username)}</a></b>

🎓 Наставник: ${mentorInfo}
👨🏼‍💻 Оператор: ${operatorInfo}

💳 Кошелек: <code>${profit.user.dataValues.trc ? escapeHTML(profit.user.dataValues.trc) : "Не указан"}</code>
`;

    return ctx.replyOrEdit(text, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("👤 Перейти к пользователю", `admin_user_${profit.userId}`)],
        [Markup.callbackButton("✍️ Перейти к вбиверу", `admin_user_${profit.writerId}`)],
        [
          Markup.callbackButton(locale.newProfit.payed, `admin_${userId ? `user_${userId}_` : ""}profit_${profit.id}_set_status_payed`),
          Markup.callbackButton(locale.newProfit.lok, `admin_${userId ? `user_${userId}_` : ""}profit_${profit.id}_set_status_lok`),
        ],
        [
          Markup.callbackButton(locale.newProfit.razvitie, `admin_${userId ? `user_${userId}_` : ""}profit_${profit.id}_set_status_razvitie`),
          Markup.callbackButton(locale.newProfit.wait, `admin_${userId ? `user_${userId}_` : ""}profit_${profit.id}_set_status_wait`),
        ],
        [Markup.callbackButton("❌ Удалить профит", `admin_${userId ? `user_${userId}_` : ""}profit_${profit.id}_delete`)],
        [Markup.callbackButton("◀️ Назад", userId ? `admin_user_${profit.userId}_profits_1` : `admin_profits_1`)],
      ]),
    }).catch((err) => err);
  } catch (err) {
    console.error("Ошибка при отображении профита:", err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
