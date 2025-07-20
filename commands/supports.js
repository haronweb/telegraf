const { Markup } = require("telegraf");
const { Operators, User, Profit } = require("../database");

module.exports = async (ctx) => {
  try {
    const operators = await Operators.findAll({ where: { status: 1 } });
    const user = await User.findOne({ where: { id: ctx.from.id } });

    const showOffline = ctx.match && ctx.match[1] === "show"; // show или hide

    const formatProfits = (sum) => (sum ? `${sum} $` : "0 $");

    const operatorsWithProfits = await Promise.all(
      operators.map(async (op) => {
        const profitsSum = await Profit.sum("amount", {
          where: { operator: op.userId },
        });
        return {
          ...op.dataValues,
          profitsSum: profitsSum || 0,
        };
      })
    );

    const hasOfflineOperators = operatorsWithProfits.some((op) => op.work == 0); // 🟢 Проверяем есть ли оффлайн

    const sortedOperators = operatorsWithProfits
      .sort((a, b) => {
        if (a.work !== b.work) {
          return b.work - a.work; // Онлайн первыми
        }
        return b.profitsSum - a.profitsSum;
      })
      .filter((op) => showOffline || op.work == 1); // Если оффлайн скрыты, фильтруем

    const getButtonLabel = (operatorData) => {
      const status = operatorData.work == 1 ? "🟢" : "🔴";
      const name = operatorData.username
        ? `@${operatorData.username}`
        : `ID: ${operatorData.id}`;
      const percent = operatorData.percent || 0;
      const profitsFormatted = formatProfits(operatorData.profitsSum);
      return `${status} ${name} | ${percent}% | ${profitsFormatted}`;
    };

    const buttons = sortedOperators.map((operatorData) => [
      Markup.callbackButton(
        getButtonLabel(operatorData),
        `operator_${operatorData.id}`
      ),
    ]);

    // 🟢 Кнопка только если есть оффлайн операторы
    const toggleOfflineButton = hasOfflineOperators
      ? Markup.callbackButton(
          showOffline
            ? "⬆️ Скрыть оффлайн операторов"
            : "⬇️ Показать оффлайн операторов",
          showOffline ? "toggle_offline_hide" : "toggle_offline_show"
        )
      : null;

    const finalButtons =
      buttons.length > 0
        ? buttons
        : [[Markup.callbackButton("Список пуст", "none")]];

    await ctx.answerCbQuery("👨🏼‍💻 Получаю операторов ").catch((err) => err);

    const operator = await Operators.findOne({
      where: { userId: user.operator },
    });

    const operatorUsername = operator
      ? operator.username
        ? `@${operator.username}`
        : `ID: ${operator.id}`
      : "неизвестный";

    if (user.operator == null) {
      return ctx
        .replyOrEdit(
          `👨🏼‍💻 <b>Список операторов</b>

<i>Выберите оператора для сопровождения. Назначенный оператор будет автоматически получать процент от ваших профитов.</i>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              ...finalButtons,
              ...(toggleOfflineButton ? [[toggleOfflineButton]] : []),
              [Markup.callbackButton("◀️ Назад", "help_work")],
            ]),
          }
        )
        .catch((err) => err);
    } else {
      return ctx
        .replyOrEdit(
          `👨🏼‍💻 У тебя уже есть оператор ${operatorUsername}

Процент оператора: <b>${operator.percent || 0}%</b>
Статус: <b>${operator && operator.work ? "🟢 Онлайн" : "🔴 Оффлайн"}</b>`,
          {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("❌ Отказаться", `refuse_operator`)],
              [Markup.callbackButton("◀️ Назад", "help_work")],
            ]),
          }
        )
        .catch((err) => err);
    }
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
