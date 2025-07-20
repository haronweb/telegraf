const { Markup } = require("telegraf");
const { MyDomains } = require("../database");
const { Op } = require("sequelize");

module.exports = async (ctx) => {
  try {
    const userDomains = await MyDomains.findAll({ where: { userId: ctx.from.id } });

    const buttons = [];

    for (const domain of userDomains) {
      // Определяем владельца домена (первый по времени)
      const allSameDomains = await MyDomains.findAll({
        where: { domain: domain.domain },
        order: [["createdAt", "ASC"]],
      });

      const owner = allSameDomains[0];
      const isOwner = ctx.from.id === owner.userId;

      buttons.push([
        Markup.callbackButton(
          `${isOwner ? "👑 " : ""}ID ${domain.id} | ${domain.domain}`,
          `my_domains_${domain.id}`
        ),
      ]);
    }

    if (buttons.length === 0) {
      buttons.push([Markup.callbackButton("Список пуст", "none")]);
    }

    // await ctx.answerCbQuery("Получаю домены!").catch(() => {});

    return ctx.replyOrEdit(
      `🔗 Список ваших доменов (Всего: ${userDomains.length})

🚫 Использование доменов для <b>DDoS-атак</b> или <b>вредоносной активности</b> приведёт к <u><b>вечной блокировке во всех проектах</b></u> <b><u>Haron Rent</u></b>.

⚠️ <i>Один домен может быть привязан <b>только к одной команде</b> Haron Rent.</i> <i>Повторное добавление этого же домена в другую команду невозможно.</i>

ℹ️ <i>При создании ссылок используется <b>первый добавленный домен</b>.</i>

`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("➕ Добавить новый домен", "add_my_domains")],
          [Markup.callbackButton("❌ Удалить все домены", "delete_my_domains")],
          [Markup.callbackButton("◀️ Назад", "settings")],
        ]),
      }
    );
  } catch (err) {
    console.error(err);
    return ctx.reply("❌ Ошибка").catch(() => {});
  }
};
