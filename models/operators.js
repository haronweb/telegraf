"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {

      userId: DataTypes.BIGINT,
      username: DataTypes.TEXT,
      about: DataTypes.TEXT,
      status: DataTypes.BOOLEAN,
      work: DataTypes.BOOLEAN,

      percent: DataTypes.INTEGER,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Operators",
    }
  );
  return User;
};
