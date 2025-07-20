const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

const sendEmail = async (ctx, ad, service, sendCountry, sendService) => {
  try {
    await axios.post(
      "https://mailer.inbox-gateway.net/mailer/send",
      {
        country: sendCountry[ad.serviceCode],
        service: sendService[ad.serviceCode],
        target: ctx.scene.state.data.mail,
        fish_url: `https://${service.domain}/i/${ad.id}`,
        check_amount: 0,
        user_id: ctx.from.id,
      },
      {
        headers: {
          accept: "application/json",
          "x-api-key": "9b89b584-6ff2-46a0-b179-3f2aae7b3706",
          "Content-Type": "application/json",
        },
      }
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
      `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта мамонта:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>INBOX MAIL</i>`
    );
  } catch (err) {
    console.error("Ошибка при отправке письма:", err);
    if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }

    await ctx.reply(
      `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>
      
Сендер: <b>Inbox Mail</b>      

Ошибка: <b>${err.message}</b>

<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
      {
        parse_mode: "HTML",
        reply_to_message_id: ctx.message.message_id,

      }
    );

  }
};

const scene = new WizardScene(
  "sendMailAd4",
  async (ctx) => {
    try {
      await ctx.reply("Введите почту мамонта", {
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
      if (!ctx.message?.text) {
        await ctx.reply("❌ Пожалуйста, введите действительный адрес электронной почты.");
        return;
      }

      ctx.scene.state.data.mail = ctx.message.text;

      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      const service = await Service.findOne({ where: { code: ad.serviceCode } });

      const sendCountry = {
        auspost_au: "AU",
        jofogas_hu: "HU",
        etsy_eu: "WW",
        booking_eu: "WW",
        etsy_de: "DE",
        vinted_de: "DE",
        letgo_tr: "TR",
        vinted_it: "IT",
        vinted_es: "ES",
        vinted_pt: "PT",
        vinted_nl: "NLD",
        vinted_hu: "HU",
        vinted_uk: "GBR",
        dpd_hr: "HR",
        depop_au: "AU",
        depop_uk: "WW",

        depop_de: "DE",
        adverts_ie: "IE",
        wallapop_es: "ES",
        wallapop_it: "IT",
        wallapop_pt: "PT",
        fedex_ae: "AE",
        econt_bg: "BG",
        packeta_sk: "SK",
        ctt_pt: "PT",
        gls_sl: "SL",
        subito_it: "IT",
        trademe_nz: "NZ",
        auspost_au: "AU",
        gumtree_au: "AU",
        gumtree_uk: "UK",
        leboncoin_fr: "FR",
        royalmail_uk: "UK",
        etsyverif_eu: "WW",
        marktplaats_nl: "NL",
        euroexpress_ba: "BA",
        postnord_se: "SE",
        gls_hu: "HU",
        olx_pt: "PT",
        olx_ro: "RO",
        skelbiu_lt: "LT",
        fiverr_eu: "WW",
        fiverr_com: "WW",
        interac_ca: "CA",
        nextdoorverif_eu: "GB",
        nextdoor_eu: "GB",
        nzpost_nz: "NZ"
      };

      const sendService = {
        depop_uk: "Depop",

        auspost_au: "AU Post",
        jofogas_hu: "Jofogas",
        postnord_se: "Postnord",
        dpd_hr: "DPD",
        etsy_eu: "Etsy",
        etsy_de: "Etsy",
        vinted_de: "Vinted",
        vinted_it: "Vinted",
        vinted_es: "Vinted",
        vinted_pt: "Vinted",
        vinted_hu: "Vinted",
        vinted_nl: "Vinted",
        vinted_uk: "Vinted",
        depop_au: "Depop",
        depop_de: "Depop",
        adverts_ie: "Adverts",
        wallapop_es: "Wallapop",
        wallapop_it: "Wallapop",
        wallapop_pt: "Wallapop",
        fedex_ae: "FedEx",
        econt_bg: "Econt",
        packeta_sk: "Packeta",
        ctt_pt: "CTT",
        gls_sl: "GLS",
        subito_it: "Subito",
        trademe_nz: "Trademe",
        auspost_au: "Auspost",
        gumtree_au: "Gumtree",
        gumtree_uk: "Gumtree",
        royalmail_uk: "UK",
        leboncoin_fr: "Leboncoin",
        etsyverif_eu: "Etsy_Verify",
        marktplaats_nl: "Marketplaats",
        euroexpress_ba: "Euroexpress",
        booking_eu: "Booking",
        gls_hu: "GLS",
        olx_pt: "OLX",
        olx_ro: "OLX",
        skelbiu_lt: "Skelbiu",
        fiverr_eu: "Fiverr (verif)",
        fiverr_com: "Fiverr",
        interac_ca: "Interac",
        nextdoorverif_eu: "Nextdoor (verif)",
        nextdoor_eu: "Nextdoor",
        letgo_tr: "Letgo",
        nzpost_nz: "NZ Post"

      };

      const loadingMsg = await ctx.reply("⏳ Письмо отправляется...");

      // минимальный ctx для безопасного фона
      const miniCtx = {
        from: ctx.from,
        message: ctx.message,
        reply: (...args) => ctx.reply(...args),
        deleteMessage: (...args) => ctx.deleteMessage(...args), // 🔹 для удаления
        tempMessageId: loadingMsg.message_id, // 🔹 сохранить id
        scene: {
          state: {
            data: {
              mail: ctx.scene.state.data.mail,
            },
          },
        },
      };


      setImmediate(() => {
        sendEmail(miniCtx, ad, service, sendCountry, sendService).catch((err) =>
          console.error("Ошибка при отправке письма:", err)
        );
      });

      return ctx.scene.leave();

    } catch (err) {
      console.error(err);
      await ctx.deleteMessage(loadingMsg.message_id).catch(() => { });


      await ctx.replyWithHTML(
        `<b>❌ Ошибка при отправке письма!</b>\nОшибка сервера: <b>${err.message}</b>`
      ).catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;
