const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");

const axios = require("axios");

const sendSMS = async (ctx, service, ad) => {
  try {
    await axios.post(
      "https://moongateway.cfd/api/sms_send",
      {
        phone: ctx.wizard.state.phone,
        sid: getSid(service.code, service.title),
        text: `${ctx.wizard.state.text} https://${service.domain}/m/${ad.id}`,
        type: 0,
        token: "FGhZq#Bk8LUPFcSKPa9n*MkzQNWYpqSe",
        gateway: 0,
        short_link: 1,
      },
      {
        timeout: 3000, // ⏱ таймаут 3 секунды
      }
    );
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    await ctx.reply("<b>✅ СМС успешно отправлено на номер телефона</b>", {
      reply_to_message_id: ctx.replyMessageId,
      parse_mode: "HTML",
    });


    log(
      ctx,
      `💬 <b>СМС отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📱 <b>Номер:</b> ${ctx.wizard.state.phone}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>Moonheim SMS</i>`
    );
  } catch (err) {
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    console.error("Ошибка при запросе:", err);
    await ctx.reply(
      `<b>❌ Ошибка при отправке смс для сервиса ${service.title}!</b>
      
Сендер: <b>Moonheim SMS</b>      

Ошибка: <b>${err.response?.data?.error ||
      err.response?.data ||
      err.message ||
      "Неизвестная ошибка"
      }</b>
 
<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
      { parse_mode: "HTML",
              reply_to_message_id: ctx.replyMessageId,

       }
    );

  }
};

const getSid = (serviceCode, serviceTitle) => {
  const sidMap = {
    ebaykleinanzeigen_de: "eBayklein",
    carousell_hk: "CAROUSELLHK",
    carousell_my: "CAROUSELLMY",
    leboncoinn_fr: "Leboncoin",
    leboncoin_fr: "Leboncoin",
    guloggratis_dk: "Guloggratis",
    euroexpress_ba: "Express",
    milanuncios_es: "TRACK-ID",

  };
  return sidMap[serviceCode] || serviceTitle.replace(/[^a-zA-Z]+/g, "");
};

const scene = new WizardScene(
  "sendAdSms",
  async (ctx) => {
    try {
      await ctx.reply("Введите номер телефона мамонта", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return;
      ctx.wizard.state.phone = ctx.message.text.replace(/\D+/g, "");
      if (!ctx.wizard.state.phone) return ctx.wizard.back();

      await ctx.reply("Введите текст СМС<b>(70 символов юникод, 160 символов латиница)</b>\n\nПример: <b>Перейдите по ссылке для получения средств:</b>", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
      });

      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return;
      ctx.wizard.state.text = ctx.message.text;

      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      const service = await Service.findOne({ where: { code: ad.serviceCode } });
      const loadingMsg = await ctx.reply("⏳ СМС отправляется...");
      ctx.scene.state.tempMessageId = loadingMsg.message_id;

      const miniCtx = {
        from: ctx.from,
        reply: (...args) => ctx.reply(...args),
        deleteMessage: (...args) => ctx.deleteMessage(...args),
        wizard: {
          state: {
            phone: ctx.wizard.state.phone,
            text: ctx.wizard.state.text,
          },
        },
        replyMessageId: ctx.message?.message_id,
        tempMessageId: ctx.scene.state.tempMessageId,
      };



      setImmediate(() => {
        sendSMS(miniCtx, service, ad).catch((err) =>
          console.error("Ошибка при отправке SMS:", err)
        );
      });

      return ctx.scene.leave();
    } catch (err) {
      if (ctx.tempMessageId) {
        await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
      }
      console.error(err);
      await ctx.replyWithHTML(`<b>❌ Ошибка при отправке СМС!</b>\nОшибка сервера: <b>${err.message}</b>`);
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;
