const { Markup } = require("telegraf");
const { Country, Service, Profiles } = require("../database");
const chunk = require("chunk");
const locale = require("../locale");

module.exports = async (ctx, countryCode) => {
  try {
    const services = await Service.findAll({
      where: {
        countryCode,
        status: 1,
      },
      order: [["title", "asc"]],
    });
    const profiles = await Profiles.findAll({ where: { userId: ctx.from.id } });

    if (profiles == 0) {
      await ctx.deleteMessage().catch((err) => err);

      await ctx.editMessageText(
        `⚠️ <b>Профиль не найден</b>\n\nПожалуйста, добавьте или сгенерируйте профиль, чтобы создать ссылку.`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("➕ Добавить профиль", "add_profile2")],
            [Markup.callbackButton("🎲 Генерация профиля", "generate_profile_createlink")],
            [Markup.callbackButton("◀️ Вернуться в меню", "start")],
          ]),
        }
      );
    } else

    if (ctx.state.bot.work == true) {
      var buttons = chunk(
        services.map((v) =>
          Markup.callbackButton(v.title, `create_link_service_${v.code}`)
        ),
        2
      );
      if (buttons.length < 1)
        buttons = [[Markup.callbackButton("Страница пуста", "none")]];

      // await ctx.deleteMessage().catch((err) => err);
      await ctx.answerCbQuery("Выберите сервис ").catch((err) => err);

      return ctx
        .replyOrEdit(locale.choose_service, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            ...buttons,

            [Markup.callbackButton(locale.go_back, "create_link1")],
          ]),
        })
        .catch((err) => err);
    } else {
      return ctx
        .answerCbQuery("❌ STOP WORK, ожидайте рассылки!", true)
        .catch((err) => err);
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
