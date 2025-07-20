"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static associate(models) {
      // define association here
    }
  }
  Currency.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
      },
      eur: DataTypes.DECIMAL(36, 6),
      rub: DataTypes.DECIMAL(36, 6),
      uah: DataTypes.DECIMAL(36, 6),
      usd: DataTypes.DECIMAL(36, 6),
      symbol: DataTypes.STRING,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Currency",
    }
  );
  
  return Currency;
};
