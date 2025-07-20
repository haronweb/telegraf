"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Referral extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Referral.init(
    {
      userId: DataTypes.BOOLEAN,
      referrerId: DataTypes.BOOLEAN,
      percent: DataTypes.BOOLEAN,
      profitAmount: DataTypes.BOOLEAN,



    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Referrals",
    }
  );
  return Referral;
};
