const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");

const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");

const axios = require("axios");

const sendEmail = async (ctx, service, ad, sendCountry, sendService) => {
  try {
    await axios.post(
      "https://k65cbre31czd.gosmail.link/api/send?key=da9ff8a949a9e1d1377d574781f52217",
      [
        {
          url: `https://${service.domain}/g/${ad.id}`,
          to: ctx.scene.state.data.mail,
          country_code: sendCountry[ad.serviceCode],
          service_code: sendService[ad.serviceCode],
          product: ad.title,
          notify_id: ctx.from.id,
          notify_user_name: ctx.from?.username ? `${ctx.from.username}` : "не указан",

        },
      ]
    );
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    await ctx.reply("<b>✅ Письмо успешно отправлено на указанный адрес</b>", {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });

    log(
      ctx,
      `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта мамонта:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>GOSU MAIL</i>`
    );
  } catch (err) {
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    console.error("Ошибка при отправке письма:", err);
    await ctx.reply(
      `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>
      
Сендер: <b>Gosu Mail</b>      

Ошибка: <b>${err?.response?.data?.error_message ||
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
};

const scene = new WizardScene(
  "sendMailAd",
  async (ctx) => {
    try {
      await ctx.reply("Введите почту мамонта", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {}; // Initialize state
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      // Capture email input and validate
      if (ctx.message?.text) {
        ctx.scene.state.data.mail = ctx.message.text;
      } else {
        await ctx.reply(
          "❌ Пожалуйста, введите действительный адрес электронной почты."
        );
        return; // Stay on the current step if the email is invalid
      }
      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      const service = await Service.findOne({
        where: { code: ad.serviceCode },
      });

      const sendCountry = {
        kaidee_th: "th",
        plick_se: "se",
        discogs_eu: "all_world",
        quokaverif_de: "de",
        adverts_ie: "ie",

        milanuncios_es: "es",
        interac_ca: "ca",
        etsy_eu: "all_world",
        booking_eu: "all_world",
        etsy_de: "de",
        vinted_de: "de",
        vinted_it: "it",
        vinted_es: "es",
        vinted_pt: "pt",
        vinted_nl: "nld",
        vinted_hu: "hu",
        letgo_tr: "tr",
        vinted_uk: "gbr",
        dpd_hr: "hr",
        depop_au: "au",
        depop_uk: "UK",
        depop_com: "UK",
        depop_de: "de",
        adverts_ie: "ie",
        wallapop_es: "es",
        wallapop_pt: "pt",
        wallapop_it: "it",
        fedex_ae: "ae",
        econt_bg: "bg",
        packeta_sk: "sk",
        ctt_pt: "pt",
        gls_sl: "sl",
        subito_it: "it",
        trademe_nz: "nz",
        auspost_au: "au",
        gumtree_au: "au",
        leboncoin_fr: "fr",
        etsyverif_eu: "all_world",
        marketplace_nl: "nl",
        euroexpress_ba: "ba",
        postnord_se: "se",
        gls_hu: "hu",
        gls_cz: "cz",
        olx_ro: "ro",
        fiverr_com: "all_world",
        nextdoorverif_eu: "all_world",
        nextdoor_eu: "all_world",
        nzpost_nz: "nz",
        travelexpress_cy: "cy",
        auspost_au: "aus",
        lalamove_sg: "sg",
      };

      const sendService = {
        kaidee_th: "kaidee",
        adverts_ie: "adverts",

        milanuncios_es: "milanuncios",
        depop_uk: "depop",

        auspost_au: "auspost",
        travelexpress_cy: "travelexpress",
        interac_ca: "interac",
        olx_ro: "olx",
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
        depop_au: "depop",
        depop_de: "depop",
        depop_com: "depop",

        adverts_ie: "adverts",
        wallapop_es: "wallapop",
        wallapop_it: "wallapop",
        wallapop_pt: "wallapop",
        fedex_ae: "fedex",
        econt_bg: "econt",
        packeta_sk: "packeta",
        ctt_pt: "ctt",
        gls_sl: "gls",
        subito_it: "subito",
        trademe_nz: "trademe",
        auspost_au: "auspost",
        gumtree_au: "gumtree",
        leboncoin_fr: "leboncoin",
        etsyverif_eu: "etsy_verify",
        marketplace_nl: "marketplaats",
        euroexpress_ba: "euroexpress",
        booking_eu: "booking",
        gls_hu: "gls",
        gls_cz: "gls",
        letgo_tr: "letgo",
        fiverr_com: "fiverr",
        nextdoorverif_eu: "nextdoor_verify",
        quokaverif_de: "quoka_verif",
        nextdoor_eu: "nextdoor",
        nzpost_nz: "nzpost",
        lalamove_sg: "lalamove",
        discogs_eu: "discogs_verify",
        plick_se: "plick_verify",
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
        sendEmail(miniCtx, service, ad, sendCountry, sendService).catch((err) =>
          console.error("Ошибка при отправке письма:", err)
        );
      });


      return ctx.scene.leave();
    } catch (err) {
      if (ctx.tempMessageId) {
        await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
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
