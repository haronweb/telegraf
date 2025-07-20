"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SupportChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SupportChat.init(
    {
      userId: DataTypes.BIGINT,
      title: DataTypes.TEXT,
      text: DataTypes.TEXT,
      photo: DataTypes.TEXT,
      countryId: DataTypes.TEXT,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "supporttemps",
    }
  );
  return SupportChat;
};
