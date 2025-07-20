const axios = require("axios");

const botToken = process.env.BOT_TOKEN // 🔹 ЗАМЕНИ НА СВОЙ ТОКЕН БОТА

module.exports = async function uploadToTelegram(fileId) {
  try {
    // Запрашиваем file_path у Telegram API
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );

    if (response.data.ok) {
      const filePath = response.data.result.file_path;

      // Формируем ссылку на изображение
      const telegramUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
      return telegramUrl;
    } else {
      throw new Error("❌ Ошибка при получении file_path");
    }
  } catch (error) {
    console.error("❌ Ошибка загрузки в Telegram:", error.message);
    throw error;
  }
};
