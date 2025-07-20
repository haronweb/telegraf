const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Ad, Service, Profiles } = require("../database");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const log = require("../helpers/log");
const rand = require("../helpers/rand");

const FILES_DIR = "/root/bot/scenes/files/";

if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

const scene = new WizardScene(
  "createFileLinkAtomOlx",
  async (ctx) => {
    try {
      const profiles = await Profiles.findAll({ where: { userId: ctx.from.id } });

      if (profiles.length === 0) {
        await ctx.reply("❌ Нет доступных профилей.");
        return ctx.scene.leave();
      }

      const buttons = profiles.map((v) => [Markup.callbackButton(v.title, v.id.toString())]);

      await ctx.scene.reply("Выберите профиль", {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при получении профилей.");
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.callbackQuery || ctx.callbackQuery.data === "cancel") {
        await ctx.reply("❌ Действие отменено.");
        return ctx.scene.leave();
      }

      const profileId = parseInt(ctx.callbackQuery.data);
      const profile = await Profiles.findOne({ where: { id: profileId } });

      if (!profile) {
        await ctx.reply("❌ Профиль не найден.");
        return ctx.scene.leave();
      }

      ctx.scene.state.profile = {
        address: profile.address,
        name: profile.name,
        phone: profile.phone,
      };

      await ctx.scene.reply("Чекер", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Включить", "true"), Markup.callbackButton("Выключить", "false")],
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при выборе профиля.");
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !["true", "false"].includes(ctx.callbackQuery.data)) {
      return ctx.scene.reply("Пожалуйста, выберите одну из предложенных опций.", {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),

      });
    }
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
    const filePath = path.resolve(FILES_DIR, `${ctx.from.id}.txt`);
    const loadingMessage = await ctx.reply("⏳ Загружаю файл...");

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios({ url: fileUrl, responseType: "stream" });
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on("finish", async () => {
      try {
        const txtString = await fs.promises.readFile(filePath, "utf8");
        const cleanString = txtString.replace(/^\uFEFF/, "").trim();
        const json = JSON.parse(cleanString);

        const service = await Service.findOne({ where: { code: "olx_ro" } });
        if (!service) {
          await ctx.reply("❌ Сервис не существует");
          return ctx.scene.leave();
        }

        let links = "";
        for (const [key, value] of Object.entries(json)) {
          const adId = parseInt(rand(999999, 99999999) + new Date().getTime() / 10000);
          await Ad.create({
            id: adId,
            userId: ctx.from.id,
            balanceChecker: ctx.wizard.state.balanceChecker,
            name: ctx.scene.state.profile.name,
            adLink: value.adLink,

            address: ctx.scene.state.profile.address,
            title: value.title,
            photo: value.img_url,
            serviceCode: "olx_ro",
          });

          links += `https://${service.domain}/${adId} | ${value.seller}\n`;
        }

        const outputFile = path.resolve(FILES_DIR, `olx-${ctx.from.id}.txt`);
        await fs.promises.writeFile(outputFile, links);

        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
        await ctx.replyWithDocument({ source: outputFile });

        log(ctx, `Спарсил файл OLX`);
        ctx.scene.leave();
      } catch (err) {
        console.error(err);
        await ctx.reply("❌ Произошла ошибка при обработке файла.");
        return ctx.scene.leave();
      }
    });

    writer.on("error", async (err) => {
      console.error(err);
      await ctx.reply("❌ Ошибка при загрузке файла.");
      return ctx.scene.leave();
    });
  }
);

module.exports = scene;
