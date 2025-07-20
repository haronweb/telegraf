"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MyDomains extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MyDomains.init(
    {
      userId: DataTypes.BIGINT,

      domain: DataTypes.TEXT,
      zoneId: DataTypes.TEXT,


    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "MyDomains",
    }
  );
  return MyDomains;
};
