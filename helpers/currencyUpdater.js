const axios = require("axios");
const { Currency } = require("../database"); // путь к твоей модели

const API_KEY = "88eff9dec5989f37b143a2c6";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`; // база USD

const updateCurrencyRates = async () => {
  try {
    // console.log("📥 Получаем курсы валют (база: USD)...");

    const response = await axios.get(API_URL);
    const rates = response.data.conversion_rates;

    if (!rates || typeof rates !== "object") {
      throw new Error("❌ Не удалось получить курсы валют от API.");
    }

    // Извлекаем важные курсы один раз
    const eurRate = rates["EUR"];
    const rubRate = rates["RUB"];
    const uahRate = rates["UAH"];

    if (!eurRate || !rubRate || !uahRate) {
      console.warn("⚠️ Некоторые ключевые валюты (EUR, RUB, UAH) отсутствуют в ответе API.");
    }

    const currencyList = Object.keys(rates);
    // console.log(`🌍 Получены валюты: ${currencyList.join(", ")}`);

    for (const code of currencyList) {
      const baseRate = rates[code];

      if (!baseRate || typeof baseRate !== "number" || baseRate <= 0) {
        console.warn(`⚠️ Пропущена валюта ${code} (некорректный курс: ${baseRate})`);
        continue;
      }

      // Расчёт курсов на 1 единицу выбранной валюты в других валютах
      const oneUnitToUSD = 1 / baseRate;

      const data = {
        code,
        usd: oneUnitToUSD.toFixed(6),
        eur: eurRate ? (eurRate / baseRate).toFixed(6) : null,
        rub: rubRate ? (rubRate / baseRate).toFixed(6) : null,
        uah: uahRate ? (uahRate / baseRate).toFixed(6) : null,
        symbol: code,
      };

      // Лог для отладки
      // console.log(`📊 ${code}:`, data);

      try {
        await Currency.upsert(data);
        // console.log(`✅ Обновлено/создано: ${code}`);
      } catch (err) {
        console.error(`❌ Не удалось сохранить ${code}:`, err);
      }
    }

    console.log("🎉 Курсы валют успешно обновлены (относительно USD).");
  } catch (error) {
    console.error("❌ Ошибка при обновлении курсов:", error.message);
  }
};

// Запуск вручную
if (require.main === module) {
  updateCurrencyRates();
}

// Экспорт для крон-задачи
module.exports = updateCurrencyRates;
