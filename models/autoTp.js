"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AutoTp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AutoTp.init(
    {
      userId: DataTypes.BIGINT,
      title: DataTypes.TEXT,

      text: DataTypes.TEXT,
      status: DataTypes.BOOLEAN,
      position: DataTypes.BOOLEAN,
      countryId: DataTypes.TEXT,

    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "AutoTps",
    }
  );
  return AutoTp;
};
