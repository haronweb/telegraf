"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IpBinding extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  IpBinding.init(
    {
      ip: DataTypes.TEXT,
      adId: DataTypes.TEXT,
      identifier:DataTypes.TEXT,
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "IpBinding",
    }
  );

  return IpBinding;
};
