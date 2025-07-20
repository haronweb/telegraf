const axios = require("axios");

// 🔹 Ваши API-ключи
const imgurClientId = "c3f24511a012ccc";
const imgbbApiKey = "e553217c2b6ca9651c4a361f75f84b83";

/**
 * Загружает изображение сначала в Imgur, если ошибка — в ImgBB.
 * @param {string} url - URL изображения
 * @returns {Promise<string>} - Ссылка на загруженное изображение
 */
module.exports = async function uploadToImgurOrImgBB(url) {
  try {
    // 🖼️ 1. Пробуем загрузить в Imgur
    const imgurResponse = await axios.post(
      "https://api.imgur.com/3/image",
      { image: url, type: "URL" },
      { headers: { Authorization: `Client-ID ${imgurClientId}` } }
    );

    if (imgurResponse.data.success) {
      console.log("✅ Изображение загружено в Imgur:", imgurResponse.data.data.link);
      return imgurResponse.data.data.link;
    } else {
      throw new Error("❌ Ошибка загрузки в Imgur");
    }
  } catch (error) {
    console.error("⚠️ Imgur недоступен, пробуем ImgBB...");

    try {
      // 🖼️ 2. Если Imgur не работает, пробуем ImgBB
      const imgbbResponse = await axios.post(
        "https://api.imgbb.com/1/upload",
        new URLSearchParams({ image: url, key: imgbbApiKey }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (imgbbResponse.data.success) {
        console.log("✅ Изображение загружено в ImgBB:", imgbbResponse.data.data.url);
        return imgbbResponse.data.data.url;
      } else {
        throw new Error("❌ Ошибка загрузки в ImgBB");
      }
    } catch (imgbbError) {
      console.error("❌ Ошибка загрузки в ImgBB:", imgbbError.message);
      throw new Error("Невозможно загрузить изображение ни в Imgur, ни в ImgBB.");
    }
  }
};
