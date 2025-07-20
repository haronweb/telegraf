"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Profit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Profit.init(
    {
      userId: DataTypes.BIGINT,
      amount: DataTypes.DECIMAL(36, 2),
      workerAmount: DataTypes.TEXT,
      convertedAmount: DataTypes.DECIMAL(36, 2),
      serviceTitle: DataTypes.STRING,
      currency: DataTypes.STRING,
      status: DataTypes.TINYINT,
      writerId: DataTypes.BIGINT,
      adId: DataTypes.TEXT,


      channelMessageId: DataTypes.BIGINT,
      chatMessageId: DataTypes.BIGINT,

      mentor: DataTypes.TEXT,

      mentorAmount: DataTypes.TEXT,
      mentorConvAmount: DataTypes.TEXT,

      operatorAmount: DataTypes.TEXT,
      operatorConvAmount: DataTypes.TEXT,

      operator: DataTypes.TEXT,
      bin: DataTypes.TEXT,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Profit",
    }
  );
  return Profit;
};
