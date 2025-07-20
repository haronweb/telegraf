"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Settings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Settings.init(
    {
      userId: DataTypes.BIGINT,
      username: DataTypes.TEXT,
      title: DataTypes.TEXT,
      address: DataTypes.TEXT,
      phone: DataTypes.TEXT,
      name: DataTypes.TEXT,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Profiles",
    }
  );
  return Settings;
};
