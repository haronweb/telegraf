const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Ad, Service, MyDomains, } = require("../../database");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const rand = require("../../helpers/rand");

const booking_eu_domains = ["booking.com", "www.booking.com"];
const filesDir = "/root/bot/scenes/files/"; // <--- Указываем папку для всех файлов

const scene = new WizardScene(
  "booking",
  async (ctx) => {
    try {
      await ctx.scene.reply("Отправьте ссылку на отель", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      console.error("Error occurred:", err);
      await ctx
        .reply("❌ Ошибка")
        .catch((err) => console.error("Error occurred while replying:", err));
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      var url;
      try {
        url = new URL(ctx.message.text);
      } catch (err) {
        await ctx
          .reply("❌ Введите валидную ссылку")
          .catch((err) => console.error("Error occurred while replying:", err));
        return ctx.wizard.prevStep();
      }
      if (!booking_eu_domains.includes(url.host)) {
        await ctx
          .reply("❌ Введите ссылку на объявление BOOKING.COM")
          .catch((err) => console.error("Error occurred while replying:", err));
        return ctx.wizard.prevStep();
      }

      await ctx.scene
        .reply("⌛️ Обрабатываю ссылку...")
        .catch((err) => console.error("Error occurred while replying:", err));
      const ad = await axios.get(encodeURI(url.href)),
        $ = cheerio.load(ad.data);
      const info = {
        title: $('meta[property="og:title"]').attr("content")?.trim() || "",
        photo: $('meta[property="og:image"]').attr("content")?.trim() || "",
        adLink: url.href,
      };

      console.log(info);

      if (!info.title) {
        await ctx.scene
          .reply("❌ Не удалось спарсить объявление")
          .catch((err) => console.error("Error occurred while replying:", err));
        return ctx.scene.leave();
      }
      ctx.wizard.state.title = info.title;
      ctx.wizard.state.photo = info.photo;

      const domains = await MyDomains.findAll({
        where: { userId: ctx.from.id },
      });

      const service = await Service.findOne({
        where: {
          code: "booking_eu",
        },
      });

      await ctx.scene.reply(`Выберите домен:`, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Общий", `${service.domain}`)],
          ...domains.map((v) => [
            Markup.callbackButton(v.domain, `${v.domain}`),
          ]),
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.error("Error occurred:", err);
      await ctx
        .reply("❌ Ошибка")
        .catch((err) => console.error("Error occurred while replying:", err));
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.domain = ctx.callbackQuery.data;

      var textContent = `<b> Отправьте файл в формате .xls</b>
    
<i>👆 В прикрепленном файле пример таблицы</i>`;

      await ctx
        .deleteMessage()
        .catch((err) =>
          console.error("Error occurred while deleting message:", err)
        );

      await ctx.replyWithDocument(
        {
          source: path.join(filesDir, "table.xlsx"), // <-- Путь изменен
        },
        {
          caption: textContent,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      console.error("Error occurred:", err);
      await ctx
        .reply("❌ Ошибка")
        .catch((err) => console.error("Error occurred while replying:", err));
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message || !ctx.message.document) {
        return ctx
          .reply("❌ Неверный формат сообщения. Ожидался документ.")
          .catch((err) => console.error("Error occurred while replying:", err));
      }
      const fileId = ctx.message.document.file_id;

      const uploadedXlsPath = path.join(filesDir, `${ctx.from.id}.xls`); // <-- путь изменен

      await ctx
        .reply("⏳ Скачиваю файл...")
        .catch((err) => console.error("Error occurred while replying:", err));

      let links = "";
      let links2 = "";

      const service = await Service.findOne({
        where: {
          code: "booking_eu",
        },
      });

      if (!service) {
        await ctx.scene
          .reply("❌ Сервис не существует")
          .catch((err) => console.error("Error occurred while replying:", err));
        return ctx.scene.leave();
      }

      await ctx.telegram.getFileLink(fileId).then(async (url) => {
        await axios({ url, responseType: "stream" }).then(async (response) => {
          response.data
            .pipe(fs.createWriteStream(uploadedXlsPath))
            .on("finish", async () => {
              await ctx.reply("⌛️ Генерирую...");

              const res = await axios.post("/xls", {
                fileName: ctx.from.id,
              });

              const adCreationPromises = res.data.map(async (v) => {
                try {
                  const price = v["Price"] || v["Total Payment"];
                  const currency = v["Currency"] || v["Total Payment,Currency"];

                  let priceWithCurrency = "";
                  if (price && currency) {
                    priceWithCurrency = `${price} ${currency}`;
                  } else if (price) {
                    priceWithCurrency = price;
                  }

                  const ad = await Ad.create({
                    id: parseInt(
                      rand(999999, 99999999) + new Date().getTime() / 10000
                    ),
                    userId: ctx.from.id,
                    balanceChecker: false,
                    title: ctx.wizard.state.title,
                    photo: ctx.wizard.state.photo,
                    price: priceWithCurrency,
                    name: v["Guest Name(s)"] || v["Booker Name"],
                    date1: v["Arrival"] || v["Check-in"],
                    date2: v["Departure"] || v["Check-out"],
                    serviceCode: "booking_eu",
                  });
                  links += `${
                    v["Reservation Number"] || v["Book Number"]
                  }|https://${ctx.wizard.state.domain}/${ad.id}|${
                    v["Booker Name"] || v["Guest Name(s)"]
                  }\n`;
                  links2 += `${
                    v["Reservation Number"] || v["Book Number"]
                  }|https://${ctx.wizard.state.domain}/${ad.id}\n`;
                } catch (error) {
                  console.error("Error creating ad:", error);
                }
              });

              await Promise.all(adCreationPromises);

              const bookingsFile = path.join(
                filesDir,
                `bookings-${ctx.from.id}.txt`
              );
              const bookingsNoNameFile = path.join(
                filesDir,
                `bookings-no-name-${ctx.from.id}.txt`
              );

              fs.writeFile(bookingsFile, links, (err) => {
                if (err) throw err;

                fs.writeFile(bookingsNoNameFile, links2, (err) => {
                  if (err) throw err;

                  setTimeout(async () => {
                    await ctx.replyWithDocument({ source: bookingsFile });
                    await ctx.replyWithDocument({ source: bookingsNoNameFile });
                  }, 5000);
                });
              });
            });
        });
      });

      return ctx.scene.leave();
    } catch (err) {
      console.error("Error occurred:", err);
      await ctx
        .reply("❌ Ошибка")
        .catch((err) => console.error("Error occurred while replying:", err));
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
