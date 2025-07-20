const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Ad, Service, User } = require("../database");

const myAd = require("../commands/myCreateAd");
const log = require("../helpers/log");

const axios = require('axios');

const scene = new WizardScene(
  "screenshot2",
  async (ctx) => {
    try {
      const ad = await Ad.findOne({
        where: {
          id: ctx.scene.state.adId,
        },
      });

      if (!ad) {
        await ctx.reply("❌ Объявление не найдено.");
        return ctx.scene.leave();

      }

      // console.log("Проверка поля screen2:", ad.screen2); // Отладочное сообщение

      // Проверяем, сгенерирован ли уже скриншот
      if (ad.screen2) {
        await ctx.answerCbQuery("❌ Скриншот уже был сгенерирован ранее.",true);
        return ctx.scene.leave();
      }

      const adLink = ad.adLink; // Ссылка на объявление
      if (!adLink) {
        await ctx.reply("❌ Ссылка на объявление отсутствует.");
        return ctx.scene.leave();
      }

      await ctx.answerCbQuery("⏳ Подождите...").catch((err) => err);

      const apiUrl = 'http://212.113.122.105:8000/generate_screenshot';
      const data = {
        url: adLink, // Передаем ссылку из ad.adLink
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Отправка запроса на новый API
      const response = await axios.post(apiUrl, data, { 
        headers,
        timeout: 4000 // ⏰ 15 секунд максимум ждём ответ от API
      }); 
      if (response.status === 200 && response.data.success) {
        const base64Image = response.data.screenshot_base64;
      
        if (base64Image) {
          const screenshotBuffer = Buffer.from(base64Image, 'base64');
      
          await ctx.replyWithPhoto(
            { source: screenshotBuffer },
            { caption: "✅ Скриншот успешно сгенерирован." }
          );
      const worker = await User.findOne({ where: { id: ad.userId} }); // Предполагается, что у объявления есть userId
const service = await Service.findOne({ where: { code: ad.serviceCode } });

const workerName = worker ? worker.username || `ID: ${worker.id}` : "Неизвестный воркер";
const serviceName = service ? service.title : "Неизвестный сервис";

// Отправляем уведомление в указанный чат
await ctx.telegram.sendMessage(
  -1002255162886, // ID чата
  `📸 <b>Скриншот успешно сгенерирован</b>\n\n` +
    `👤 Воркер: <b>${workerName}</b>\n` +
    `🛠 Сервис: <b>${serviceName}</b>\n` +
    `🔗 Ссылка: <b>${adLink}</b>`,
  {
    parse_mode: "HTML",
    disable_web_page_preview: true, // Отключение превью ссылки
  }
);
} else {
  await ctx.reply("❌ Ошибка: API не вернул данные изображения.");
}
} else {
  await ctx.reply(`❌ Ошибка: ${response.statusText || 'Неизвестная ошибка'}`).catch((err) => err);
}


      // Обновляем состояние объявления
      await ad.update({
        screen2: 1,
      });

      log(ctx, "Сгенерировал отрисовку fiverr");

      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.replyWithHTML(`<b>❌ Ошибка при генерации скриншота!</b>\n\nОшибка сервера: <b>${err.message}</b>`).catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
