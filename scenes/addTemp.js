const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { SupportTemp, Country } = require("../database");
const downloadImage = require("../helpers/downloadImageChat");

// для разбиения кнопок
const chunk = (arr, size) =>
  arr.length <= size ? [arr] : [arr.slice(0, size), ...chunk(arr.slice(size), size)];

const scene = new WizardScene(
  "add_temp",

  // Шаг 1: Название шаблона
  async (ctx) => {
    try {
      await ctx.deleteMessage().catch(() => {});
      await ctx.answerCbQuery("Создаю шаблон!").catch(() => {});

      await ctx.scene.reply("Введите название шаблона", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "supportTemp_cancel")],
        ]),
      });

      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка");
      return ctx.scene.leave();
    }
  },

  // Шаг 2: Текст или изображение
  async (ctx) => {
    try {
      ctx.wizard.state.title = ctx.message.text;

      await ctx.scene.reply("Введите текст шаблона или отправьте изображение", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "supportTemp_cancel")],
        ]),
      });

      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка");
      return ctx.scene.leave();
    }
  },

  // Шаг 3: Обработка текста/фото и выбор страны
  async (ctx) => {
    try {
      if (ctx.message.text) {
        ctx.wizard.state.text = ctx.message.text;
      } else if (ctx.message.photo) {
        const photo_link = await ctx.telegram.getFileLink(
          ctx.message.photo[ctx.message.photo.length - 1].file_id
        );
        ctx.wizard.state.photo = await downloadImage(photo_link);
      }

      // Выбор страны
const countries = await Country.findAll({
  where: { status: 1 }, // ❗️ Только активные страны
  order: [["id", "asc"]],
});
      const global = countries.find((c) => c.id === "eu");
      const others = countries.filter((c) => c.id !== "eu");

      const buttons = chunk(
        others.map((c) => Markup.callbackButton(c.title, `country_${c.id}`)),
        3
      );

      if (global) buttons.push([Markup.callbackButton(global.title, `country_${global.id}`)]);

      buttons.push([Markup.callbackButton("Отменить", "supportTemp_cancel")]);

      await ctx.scene.reply("🌎 Выберите страну для шаблона", {
        reply_markup: Markup.inlineKeyboard(buttons),
      });

      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка");
      return ctx.scene.leave();
    }
  },

  // Шаг 4: Сохраняем шаблон с countryId
  async (ctx) => {
    try {
      if (!ctx.callbackQuery?.data?.startsWith("country_")) {
        await ctx.answerCbQuery("❌ Некорректный выбор");
        return;
      }

      const countryId = ctx.callbackQuery.data.replace("country_", "");
      ctx.wizard.state.countryId = countryId;

      await SupportTemp.create({
        userId: ctx.from.id,
        title: ctx.wizard.state.title,
        text: ctx.wizard.state.text || null,
        photo: ctx.wizard.state.photo || null,
        countryId,
      });

      await ctx.scene.reply(
        `<b>✅ Шаблон для ТП создан!</b>\n\n<i>Теперь вы можете его использовать при общении с мамонтом.</i>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "supportTemp_cancel")],
          ]),
        }
      );

      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка");
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
