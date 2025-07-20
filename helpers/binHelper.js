const axios = require("axios");
const { Currency } = require("../database");

const binCache = new Map();

// Получаем валюту по BIN
async function getCurrencyFromBin(bin) {
  if (binCache.has(bin)) return binCache.get(bin);

  try {
    const { data } = await axios.get(`https://bins.antipublic.cc/bins/${bin}`);
    const currencyCode = data.country_currencies;
    binCache.set(bin, currencyCode);
    return currencyCode;
  } catch (err) {
    console.error("Ошибка BIN:", err.message);
    return null;
  }
}

// Получаем курсы из БД: USD и EUR
async function getRatesFromDb(code) {
  try {
    const currency = await Currency.findOne({ where: { code } });
    return currency
      ? {
          USD: parseFloat(currency.usd),
          EUR: parseFloat(currency.eur),
        }
      : { USD: 1, EUR: 1 };
  } catch (err) {
    console.error("Ошибка получения курса из БД:", err.message);
    return { USD: 1, EUR: 1 };
  }
}

module.exports = {
  getCurrencyFromBin,
  getRatesFromDb,
};
