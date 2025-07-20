const axios = require("axios");

const imgbbApiKey = "537a26f6488468e2a668eb9ef986be2e";
const imgurClientId = "5393173190cf2ce"; // <-- Твой Client-ID

async function uploadImage(url) {
  try {
    return await tryUploadToImgBB(url);
  } catch (imgbbError) {
    console.error("❌ Ошибка загрузки на ImgBB:", imgbbError.message);
    console.log("🔄 Пробую загрузить на Imgur...");
    try {
      return await tryUploadToImgur(url);
    } catch (imgurError) {
      console.error("❌ Ошибка загрузки на Imgur:", imgurError.message);
      console.log("🔄 Пробую конвертацию в Base64...");
      try {
        return await convertImageToBase64(url);
      } catch (base64Error) {
        console.error("🚫 Ошибка конвертации в Base64:", base64Error.message);
        return null; // Возвращаем null, чтобы бот не падал
      }
    }
  }
}

// ===== Загрузка на ImgBB =====
async function tryUploadToImgBB(url) {
  try {
    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      null,
      {
        params: {
          key: imgbbApiKey,
          image: url,
        },
        timeout: 5000, // Защита от зависания
      }
    );

    if (response.data?.data?.url) {
      return response.data.data.url;
    } else {
      throw new Error("Ответ от ImgBB не содержит ссылки");
    }
  } catch (error) {
    throw new Error(`ImgBB Error: ${error.message}`);
  }
}

// ===== Загрузка на Imgur =====
async function tryUploadToImgur(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 5000 });
    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    const imgurResponse = await axios.post(
      "https://api.imgur.com/3/image",
      { image: base64Image },
      {
        headers: {
          Authorization: `Client-ID ${imgurClientId}`,
        },
        timeout: 5000,
      }
    );

    if (imgurResponse.data?.data?.link) {
      return imgurResponse.data.data.link;
    } else {
      throw new Error("Ответ от Imgur не содержит ссылки");
    }
  } catch (error) {
    throw new Error(`Imgur Error: ${error.message}`);
  }
}

// ===== Конвертация в Base64 =====
async function convertImageToBase64(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 5000 });
    return "data:image/jpeg;base64," + Buffer.from(response.data, "binary").toString("base64");
  } catch (error) {
    throw new Error(`Base64 Conversion Error: ${error.message}`);
  }
}

module.exports = uploadImage;
