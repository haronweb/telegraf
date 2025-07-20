const { Markup } = require("telegraf");
const { Country, Profiles, User } = require("../database");
const chunk = require("chunk");
const locale = require("../locale");

module.exports = async (ctx) => {
  try {
    const countries = await Country.findAll({
      order: [["id", "asc"]],
      where: {
        status: 1,
      },
    });

    const profiles = await Profiles.findAll({ where: { userId: ctx.from.id } });

    if (profiles.length === 0) {
      await ctx.editMessageText(
        `⚠️ <b>Профиль не найден</b>\n\nПожалуйста, добавьте или сгенерируйте профиль, чтобы создать ссылку.`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("➕ Добавить профиль", "add_profile")],
            [Markup.callbackButton("🎲 Генерация профиля", "generate_profile_createlink")],
            [Markup.callbackButton("◀️ Вернуться в меню", "start")],
          ]),
        }
      );
      return;
    }

    // const user = await User.findOne({ where: { id: ctx.from.id } });

    // if (user.tag == null) {
    //   await ctx.editMessageText(
    //     `⚠️ Для создание ссылки необходимо <b>#️⃣ Установить TAG</b>.`,
    //     {
    //       parse_mode: "HTML",
    //       reply_markup: Markup.inlineKeyboard([
    //         [Markup.callbackButton("➡️ Перейти к TAG", "settings_my_tags")],
    //         [Markup.callbackButton("◀️ В главное меню", "start")],
    //       ]),
    //     }
    //   );
    //   return;
    // }

  if (ctx.state.bot.work === true) {
      await ctx.answerCbQuery("🙊 Уже открываю ").catch(() => {});

      // Ищем "Всемирные"
      const globalCountry = countries.find((c) => c.id === "eu");
      // Исключаем "eu" из общего списка
      const filteredCountries = countries.filter((c) => c.id !== "eu");

      const countryButtons = chunk(
        filteredCountries.map((v) =>
          Markup.callbackButton(v.title, `create_link_${v.id}`)
        ),
        3
      );

      const globalButtonRow = globalCountry
        ? [[Markup.callbackButton(`${globalCountry.title}`, `create_link_${globalCountry.id}`)]]
        : [];

      return ctx
        .replyOrEdit(locale.choose_country, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            ...countryButtons,
            ...globalButtonRow,
            [
              Markup.callbackButton("🏨 Брони", "booking"),
              Markup.callbackButton("🔄 Кастом", "create_link_service_service_eu"),
            ],
            [Markup.callbackButton(locale.go_to_menu, "start")],
          ]),
        })
        .catch(() => {});
    } else {
      return ctx
        .answerCbQuery("❌ STOP WORK, ожидайте рассылки!", true)
        .catch(() => {});
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch(() => {});
  }
};
