const { Markup } = require("telegraf");
const { Profit } = require("../database");
const paginateButtons = require("../helpers/paginateButtons");
const locale = require("../locale");

module.exports = async (ctx, page = 1) => {
  try {
    const profits = await Profit.paginate({
      pageIndex: parseInt(page),
      pageSize: 10,
      where: {
        userId: ctx.from.id,
      },
    });
    const profits_sum = parseFloat(await Profit.sum("amount", {
      where: {
        userId: ctx.from.id,
      },
    })).toFixed(2);

    var buttons = profits.data.map((v) => [
      Markup.callbackButton(
        `${v.amount} ${v.currency} | ${v.serviceTitle}`,
        `my_profit_${v.id}`
      ),
    ]);

    // await ctx.deleteMessage().catch((err) => err);

    if (buttons.length < 1)
      buttons = [[Markup.callbackButton("Страница пуста", "none")]];
      await ctx.answerCbQuery("🙊 Уже открываю ").catch((err) => err);


    return ctx
      .replyOrEdit(`💰 Список ваших профитов: ${profits.meta.total} (${profits_sum} USD)`, {
        parse_mode:"HTML",
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          paginateButtons(profits.meta, "my_profits_"),
          [Markup.callbackButton("◀️ Назад", "start")],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
