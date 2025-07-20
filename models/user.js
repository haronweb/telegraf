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
      username: DataTypes.STRING,
      status: DataTypes.TINYINT,
      isOperator: DataTypes.BOOLEAN,
      isMentor: DataTypes.BOOLEAN,
      
      mentor: DataTypes.TEXT,
      banned: DataTypes.BOOLEAN,
      hideNick: DataTypes.BOOLEAN,
      hideService: DataTypes.BOOLEAN,
      percent: DataTypes.DECIMAL(36, 2),
      percentType: DataTypes.TINYINT,
      btc: DataTypes.STRING(256),
      trc: DataTypes.STRING(256),
      wallet: DataTypes.BOOLEAN,
      lastService: DataTypes.TEXT,
      mainService: DataTypes.TEXT,
      tag: DataTypes.TEXT,
      requestMentor: DataTypes.BOOLEAN,
      requestOperator: DataTypes.BOOLEAN,
      perehod: DataTypes.BOOLEAN,
      card: DataTypes.BOOLEAN,
                        autotp: DataTypes.BOOLEAN,

      operator: DataTypes.TEXT,
      LastTitle: DataTypes.TEXT,
      LastAbout: DataTypes.TEXT,
      LastPhoto: DataTypes.TEXT,
      smartsupp: DataTypes.TEXT,
      media: DataTypes.TEXT,
      media_type: DataTypes.TEXT,
       provider: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'square',
      }

    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
