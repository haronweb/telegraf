const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { AutoTp, Country } = require("../database");

const chunk = (arr, size) =>
  arr.length ? [arr.slice(0, size), ...chunk(arr.slice(size), size)] : [];

const scene = new WizardScene(
  "addAuto",
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch((err) => err);

      await ctx.answerCbQuery("Создаю шаблон!").catch((err) => err);

      await ctx.scene
        .reply("Введите название шаблона", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "auto_cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.title = ctx.message.text;

      await ctx.scene
        .reply("Введите текст шаблона", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "auto_cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
 async (ctx) => {
  try {
    ctx.wizard.state.text = ctx.message.text;

   const countries = await Country.findAll({
      where: { status: 1 }, // ✅ Только активные страны
      order: [["id", "asc"]],
    });

    // Отделим всемирную страну с id === "eu"
    const globalCountry = countries.find((c) => c.id === "eu");
    const filteredCountries = countries.filter((c) => c.id !== "eu");

    // Кнопки обычных стран
    let countryButtons = chunk(
      filteredCountries.map((v) =>
        Markup.callbackButton(v.title, `${v.id}`)
      ),
      3
    );

    // Добавим кнопку "Всемирные" в отдельный ряд снизу
    const globalButtonRow = globalCountry
      ? [[Markup.callbackButton(`${globalCountry.title}`, `${globalCountry.id}`)]]
      : [];

    // Добавим кнопку отмены
    const cancelButton = [
      [Markup.callbackButton("Отменить", "auto_cancel")],
    ];

    await ctx.scene
      .reply("🌎 Выберите страну для шаблона", {
        reply_markup: Markup.inlineKeyboard([
          ...countryButtons,
          ...globalButtonRow,
          ...cancelButton,
        ]),
      })
      .catch((err) => err);

    return ctx.wizard.next();
  } catch (err) {
    console.log(err);
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
},
  async (ctx) => {
    try {
      const countryId = (ctx.callbackQuery.data);
      ctx.wizard.state.countryId = countryId;

      const country = await Country.findOne({
        where: {
          id: countryId, // Убедитесь, что это поле правильно соответствует вашему countryId
          // status: 1,
        },
      });
      await AutoTp.create({
        userId: ctx.from.id,
        title: ctx.wizard.state.title,
        text: ctx.wizard.state.text,
        countryId: ctx.wizard.state.countryId, // Сохраняем ID страны
        status: 0,
      });

      await ctx.scene
        .reply(`✅ Шаблон успешно создан для страны: <b>${country.title}</b>`, {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "auto_tp")],
          ]),
        })
        .catch((err) => err);

      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
