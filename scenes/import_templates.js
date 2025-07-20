const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { SupportTemp,Country } = require("../database");
const path = require("path");
const fetch = require("node-fetch");

const scene = new WizardScene(
  "importTemplates",

  async (ctx) => {
    await ctx.deleteMessage().catch(() => {});
    await ctx.answerCbQuery("📤 Импорт шаблонов...").catch(() => {});

    await ctx.scene.reply(
      `📎 Пришли файл с шаблонами (.txt / .csv / .json)\n\nФормат: <code>Название | Текст или Ссылка На Фото</code>`,
      {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "supportTemp_cancel")],
        ]),
      }
    );

    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message || !ctx.message.document) {
      await ctx.scene.reply("📎 Пожалуйста, отправь файл.",{
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "supportTemp_cancel")],
        ]),
      });
      return;
    }

    try {
      const doc = ctx.message.document;
      const ext = path.extname(doc.file_name).toLowerCase();

      if (![".txt", ".csv", ".json"].includes(ext)) {
        await ctx.scene.reply("❌ Поддерживаются только .txt, .csv или .json файлы.",{
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "supportTemp_cancel")],
          ]),
        });
        return ctx.scene.leave();
      }

      const fileLink = await ctx.telegram.getFileLink(doc.file_id);
      const res = await fetch(fileLink.toString());
      
      const content = await res.text();

      let count = 0;

    
if (ext === ".json") {
  const countries = await Country.findAll({ attributes: ["id"] });
  const validCountryIds = countries.map((c) => c.id);

  const data = JSON.parse(content);
  for (const item of data) {
    if (item.title && (item.text || item.photo)) {
      const countryId = validCountryIds.includes(item.countryId) ? item.countryId : null;

      await SupportTemp.create({
        userId: ctx.from.id,
        title: item.title,
        text: item.text || null,
        photo: item.photo || null,
        countryId,
      });
      count++;
    }
  }
} else {
  const countries = await Country.findAll({ attributes: ["id"] });
  const validCountryIds = countries.map((c) => c.id);

  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const [title, value, countryIdRaw] = line.split("|").map((s) => s?.trim());
    if (!title || !value) continue;

    const isPhoto = value.startsWith("http");
    const countryId = validCountryIds.includes(countryIdRaw) ? countryIdRaw : null;

    await SupportTemp.create({
      userId: ctx.from.id,
      title,
      text: !isPhoto ? value : null,
      photo: isPhoto ? value : null,
      countryId,
    });

    count++;
  }
}

      await ctx.scene.reply(
        `✅ Импортировано шаблонов: <b>${count}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", "supportTemp")],
          ]),
        }
      );

      return ctx.scene.leave();
    } catch (err) {
      console.error("❌ Ошибка при импорте шаблонов:", err);
      await ctx.scene.reply("❌ Не удалось импортировать шаблоны. Убедись в корректности файла.");
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
