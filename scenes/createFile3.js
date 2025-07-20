const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Ad, Service } = require("../database"); // Предполагается, что эти модели уже определены в вашем проекте
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const log = require("../helpers/log"); // Предполагается, что этот хелпер уже определен в вашем проекте
const rand = require("../helpers/rand"); // Предполагается, что этот хелпер уже определен в вашем проекте

const scene = new WizardScene(
  "createFile3",
  async (ctx) => {
    await ctx.scene.reply("Чекер", {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton("Включить", "true"),
          Markup.callbackButton("Выключить", "false"),
        ],
        [Markup.callbackButton("Отменить", "cancel")],
      ]),
    }).catch((err) => console.log(err));
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !["true", "false"].includes(ctx.callbackQuery.data)) {
      return ctx.reply("Пожалуйста, выберите одну из предложенных опций.");
    }
    ctx.wizard.state.balanceChecker = ctx.callbackQuery.data === "true";
    await ctx.scene.reply(`Отправьте файл в формате <b>.txt</b>, созданный в @atomparser_bot`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("❌ Отменить", "cancel")],
      ]),
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.document) {
      await ctx.reply("❌ Неверный формат сообщения. Ожидался документ.");
      return ctx.scene.leave();
    }
    const fileId = ctx.message.document.file_id;
    const filePath = path.resolve(__dirname, `files`, `${ctx.from.id}.txt`);

    // Отправка сообщения "⏳" и сохранение его message_id
    const loadingMessage = await ctx.reply("⏳");

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios({ url: fileUrl, responseType: "stream" });
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on('finish', async () => {
      try {
        const txtString = await fs.promises.readFile(filePath, "utf8");
        const cleanString = txtString.replace(/^\uFEFF/, '').trim();
        const json = JSON.parse(cleanString);

        var links = "";
        const service = await Service.findOne({ where: { code: "etsyverif_eu" } });

        if (!service) {
          await ctx.reply("❌ Сервис не существует");
          return ctx.scene.leave();
        }

        for (let [key, value] of Object.entries(json)) {
          const adId = parseInt(rand(999999, 99999999) + new Date().getTime() / 10000);
          await Ad.create({
            id: adId,
            userId: ctx.from.id,
            balanceChecker: ctx.wizard.state.balanceChecker,
            title: value.seller,
            photo: value.img_url,
            serviceCode: "etsyverif_eu",
          });

          links += `https://${service.PrivateDomain}/${adId} | ${value.seller}\n`;
        }

        await fs.promises.writeFile(`haron-${ctx.from.id}.txt`, links);
        
        // Удаление сообщения "⏳"
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
        
        await ctx.replyWithDocument({ source: `haron-${ctx.from.id}.txt` });
        ctx.scene.leave();
        log(ctx, `Спарсил файл ETSY`);
      } catch (err) {
        console.log(err);
        await ctx.reply("❌ Произошла ошибка при обработке файла.");
        return ctx.scene.leave();
      }
    });
  
  
  
    writer.on('error', async (err) => {
      console.log(err);
      await ctx.reply("❌ Ошибка при загрузке файла");
      return ctx.scene.leave();
    });
  }
);

module.exports = scene;
