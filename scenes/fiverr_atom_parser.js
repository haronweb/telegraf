const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Ad, Service } = require("../database");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const log = require("../helpers/log");

const scene = new WizardScene(
  "fiverr_atom_parser",
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
    if (ctx.callbackQuery?.data === "cancel") {
      await ctx.reply("❌ Действие отменено.");
      return ctx.scene.leave();
    }
    if (!ctx.callbackQuery || !["true", "false"].includes(ctx.callbackQuery.data)) {
 return ctx.scene.reply("Пожалуйста, выберите одну из предложенных опций.", {
        reply_markup: Markup.inlineKeyboard([

          [Markup.callbackButton("Отменить", "cancel")],
        ]),

      });    }
    ctx.wizard.state.balanceChecker = ctx.callbackQuery.data === "true";
    await ctx.scene.reply(`Отправьте файл в формате <b>.txt</b>, созданный в @atomparser_bot`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("Отменить", "cancel")],
      ]),
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.callbackQuery?.data === "cancel") {
      await ctx.reply("❌ Действие отменено.");
      return ctx.scene.leave();
    }
    if (!ctx.message || !ctx.message.document) {
      await ctx.reply("❌ Неверный формат сообщения. Ожидался документ.");
      return ctx.scene.leave();
    }

    const dirPath = "/root/bot/scenes/files";
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const fileId = ctx.message.document.file_id;
    const filePath = path.resolve(dirPath, `${ctx.from.id}.txt`);
    const outputFilePath = path.resolve(dirPath, `fiverr-${ctx.from.id}.txt`);

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

        const service = await Service.findOne({ where: { code: "fiverr_com" } });
        if (!service) {
          await ctx.reply("❌ Сервис не существует");
          return ctx.scene.leave();
        }

        let links = "";
        for (const [key, value] of Object.entries(json)) {
          const adId = parseInt(Math.floor(Math.random() * 90000000) + 10000000 + new Date().getTime() / 10000);
          await Ad.create({
            id: adId,
            userId: ctx.from.id,
            balanceChecker: ctx.wizard.state.balanceChecker,
            title: value.title,
            photo: value.img_url,
            price: value.price,
            name: value.seller,
                                    adLink: value.adLink,

            address: "absent",
            serviceCode: "fiverr_com",
          });

          links += `https://${service.domain}/${adId} | ${value.seller}\n`;
        }

        await fs.promises.writeFile(outputFilePath, links);
        await ctx.replyWithDocument({ source: outputFilePath });

        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);

        await fs.promises.unlink(filePath).catch(() => {});
        await fs.promises.unlink(outputFilePath).catch(() => {});

        ctx.scene.leave();
        log(ctx, `Спарсил файл FIVERR (ATOM)`);
      } catch (err) {
        console.error(err);
        await ctx.reply("❌ Произошла ошибка при обработке файла.");
        return ctx.scene.leave();
      }
    });

    writer.on('error', async (err) => {
      console.error(err);
      await ctx.reply("❌ Ошибка при загрузке файла");
      return ctx.scene.leave();
    });
  }
);

module.exports = scene;
