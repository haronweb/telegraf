"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Currencies", [
      {
        code: "PLN",
        eur: 0.22,
        rub: 19.0,
        symbol: "zł",
      },
      {
        code: "GBP",
        eur: 1.17,
        rub: 102.18,
        symbol: "£",      
      },
      {
        code: "AUD",
        eur: 0.0103,
        rub: 0.8968,
        symbol: "AUD",
      },
      {      
        code: "KGS",
        eur: 0.0103,
        rub: 0.8968,
        symbol: "KGS",
      },
      {
        code: "MLD",
        eur: 0.050,
        rub: 4.330,
        symbol: "MLD",     
      },
      {
        code: "ARS",
        eur: 0.01,
        rub: 0.73,
        symbol: "$",     
      },
      {
        code: "GEL",
        eur: 0.3003,
        rub: 26.2168,
        symbol: "GEL",      
      },
      {        
        code: "UZS",
        eur: 0.0001,
        rub: 0.007,
        symbol: "UZS",
      },
      {         
        code: "DKK",
        eur: 0.13,
        rub: 11.7,
        symbol: "kr",
      },
      {
        code: "EUR",
        eur: 1,
        rub: 86.99,
        symbol: "€",
      },
      {
        code: "UAH",
        eur: 0.031,
        rub: 2.72,
        symbol: "₴",
      },
      {
        code: "KZT",
        eur: 0.0021,
        rub: 0.1788,
        symbol: "₸",
      },
      {
        code: "RUB",
        eur: 0.012,
        rub: 1,
        symbol: "₽",
      },
      {
        code: "SEK",
        eur: 0.098,
        rub: 8.5,
        symbol: "kr",
      },
      {
        code: "RON",
        eur: 0.2,
        rub: 17.65,
        symbol: "lei",
      },
      {
        code: "HRK",
        eur: 0.13,
        rub: 11.52,
        symbol: "Kn",
      },
      {
        code: "BGN",
        eur: 0.51,
        rub: 44.37,
        symbol: "лв",
      },
      {
        code: "RSD",
        eur: 0.01,
        rub: 0.78,
        symbol: "din",
      },
      {
        code: "BYN",
        eur: 0.33,
        rub: 29.01,
        symbol: "Br",
      },
      {
        code: "CZK",
        eur: 0.04,
        rub: 3.55,
        symbol: "₸",
      },
      {
        code: "KZT",
        eur: 0.002,
        rub: 0.17,
        symbol: "₸",
      },
      {
        code: "TRY",
        eur: 0.066,
        rub: 5.78,
        symbol: "₺",      
      },
      {
        code: "AED",
        eur: 0.2404,
        rub: 21.27,
        symbol: "aed",     
      },
      {
        code: "OMR",
        eur: 2.29,
        rub: 200.70,
        symbol: "omr",
      },
      {
        code: "ILS",
        eur: 2.29,
        rub: 200.70,
        symbol: "ILS",
      },   
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Currencies", null, {
      truncate: true,
    });
  },
};
