const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Ad, Service } = require("../database");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const log = require("../helpers/log");

const scene = new WizardScene(
  "etsy_verif_atom_parser",
  async (ctx) => {
    await ctx.scene.reply("Чекер", {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton("Включить", "true"),
          Markup.callbackButton("Выключить", "false"),
        ],
        [Markup.callbackButton("Отменить", "cancel")],
      ]),
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !["true", "false"].includes(ctx.callbackQuery.data)) {
 return ctx.scene.reply("Пожалуйста, выберите одну из предложенных опций.", {
        reply_markup: Markup.inlineKeyboard([

          [Markup.callbackButton("Отменить", "cancel")],
        ]),

      });    }
    ctx.wizard.state.balanceChecker = ctx.callbackQuery.data === "true";
    await ctx.scene.reply(`Отправьте файл в формате <b>.txt</b>, созданный в @atomparser_bot`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.document) {
      await ctx.reply("❌ Неверный формат сообщения. Ожидался документ.");
      return ctx.scene.leave();
    }

    const fileId = ctx.message.document.file_id;
    const filePath = path.resolve("/root/bot/scenes/files", `${ctx.from.id}.txt`);
    const loadingMessage = await ctx.reply("⏳ Загрузка файла...");

    try {
      const fileUrl = await ctx.telegram.getFileLink(fileId);
      const response = await axios({ url: fileUrl, responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

     writer.on("finish", async () => {
  try {
    const txtString = await fs.promises.readFile(filePath, "utf8");
    const cleanString = txtString.replace(/^\uFEFF/, '').trim();
    const json = JSON.parse(cleanString);

    const service = await Service.findOne({ where: { code: "etsyverif_eu" } });
    if (!service) {
      await ctx.reply("❌ Сервис не существует");
      return ctx.scene.leave();
    }

    let links = "";
    let idsOnly = "";
    for (const [key, value] of Object.entries(json)) {
      const adId = parseInt(Math.floor(Math.random() * 90000000) + 10000000 + new Date().getTime() / 10000);

      await Ad.create({
        id: adId,
        userId: ctx.from.id,
        balanceChecker: ctx.wizard.state.balanceChecker,
        title: value.seller,
        adLink: value.adLink,
        avatar: value.shop_photo,
        photo: value.img_url,
        serviceCode: "etsyverif_eu",
      });

      const link = `https://${service.domain}/${adId}`;
      links += `${link} | ${value.seller}\n`;
      idsOnly += `${adId}\n`;
    }

    const outputFilePath = path.resolve("/root/bot/scenes/files", `etsy-verif-${ctx.from.id}.txt`);
    const idsOnlyPath = path.resolve("/root/bot/scenes/files", `etsy-verif-ids-${ctx.from.id}.txt`);

    await fs.promises.writeFile(outputFilePath, links);
    await fs.promises.writeFile(idsOnlyPath, idsOnly);

    await ctx.replyWithDocument({ source: outputFilePath, filename: "etsy_verif_links.txt" });
    // await ctx.replyWithDocument({ source: idsOnlyPath, filename: "etsy_verif_ids.txt" });
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);

    log(ctx, `Спарсил файл ETSY VERIF (ATOM)`);
    return ctx.scene.leave();
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Произошла ошибка при обработке файла.");
    return ctx.scene.leave();
  }
});


      writer.on("error", async (err) => {
        console.error(err);
        await ctx.reply("❌ Ошибка при загрузке файла");
        return ctx.scene.leave();
      });
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при скачивании файла.");
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
