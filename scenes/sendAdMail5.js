const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

const sendEmail = async (
  ctx,
  ad,
  service,
  sendCountry,
  sendService,
  tempService
) => {
  try {
    const countryCode = sendCountry[ad.serviceCode];
    const serviceCode = sendService[ad.serviceCode];
    const template = tempService[ad.serviceCode]; // Шаблон для текущего сервиса

    if (!countryCode || !serviceCode) {
      return ctx.reply("❌ Код страны или сервиса не найден.");
    }

    // Запрос с тайм-аутом
    const response = await axios.post(
      "https://mailer.hype-node.com/api/v2/send_mail",
      {
        api_key: "dd149ed2d78a8a968cb6f62ea2b5ec55",
        title: ad.title || "Unknown",
        price: ad.price || "0",
        name: ad.name || "Unknown",
        photo: ad.photo || "https://via.placeholder.com/150",
        url: `https://${service.domain}/h/${ad.id}`,
        email: ctx.scene.state.data.mail,
        user_id: ctx.from.id,
        country_code: countryCode,
        service_code: serviceCode,
        template: template,
      },
      { timeout: 5000 } // Тайм-аут в миллисекундах
    );
  if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    await ctx.reply(
      "<b>✅ Письмо успешно отправлено на указанный адрес</b>",
      {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "HTML",
      }
    );

    log(
      ctx,
      `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта мамонта:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>HYPE MAIL</i>`
    );
  } catch (err) {
      if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    console.error("Ошибка при отправке письма:", err.message);

    // Обработка тайм-аута и других ошибок
    if (err.code === "ECONNABORTED") {
      await ctx.reply("❌ Тайм-аут: сервер слишком долго не отвечает.");
    } else {
      await ctx.reply(
        `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>
        
Сендер: <b>Hype Mail</b>      

Ошибка: <b>${err.response?.data?.error_message ||
        err.message ||
        "Неизвестная ошибка"
        }</b>

<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
        {
          parse_mode: "HTML",
                reply_to_message_id: ctx.message.message_id,

        }
      );
    }

  }
};

const scene = new WizardScene(
  "sendMailAd5",
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите почту мамонта", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
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
        await ctx.scene.reply(
          "❌ Пожалуйста, введите действительный адрес электронной почты."
        );
        return; // Оставляем на текущем шаге
      }

      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      const service = await Service.findOne({
        where: { code: ad.serviceCode },
      });

      const sendCountry = {
        kaidee_th: "th",

        fiverr_com: "eu",
        fiverr_eu: "eu",
        etsy_eu: "eu",
        etsyverif_eu: "eu",
      };

      const sendService = {
        kaidee_th: "kaidee",

        fiverr_com: "fiverr",
        fiverr_eu: "fiverr",
        etsy_eu: "etsy",
        etsyverif_eu: "etsy",
      };

      const tempService = {
        kaidee_th: "20",

        fiverr_eu: "custom",
        fiverr_com: "20",
        etsy_eu: "20",
        etsyverif_eu: "custom",
      };
    const loadingMsg = await ctx.reply("⏳ Письмо отправляется...");

      const miniCtx = {
        from: ctx.from,
        message: ctx.message,
        reply: (...args) => ctx.reply(...args),
        deleteMessage: (...args) => ctx.deleteMessage(...args),
        tempMessageId: loadingMsg.message_id,
        scene: {
          state: {
            data: {
              mail: ctx.scene.state.data.mail,
            },
          },
        },
      };


      setImmediate(() => {
        sendEmail(miniCtx, ad, service, sendCountry, sendService, tempService)
          .catch(err => console.error("Ошибка при отправке:", err));
      });

      return ctx.scene.leave();

    } catch (err) {
      await ctx.deleteMessage(loadingMsg.message_id).catch(() => { });

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
