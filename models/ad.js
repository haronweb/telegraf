"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ad extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Ad.init(
    {
      identifier: DataTypes.TEXT,

      userId: DataTypes.BIGINT,
      adLink: DataTypes.TEXT,
      myDomainLink: DataTypes.TEXT,
                  customLink: DataTypes.TEXT,

      shortLink: DataTypes.TEXT,
      status: DataTypes.TEXT,

      lastSeen: DataTypes.TEXT,



      title: DataTypes.TEXT,
      LastTitle: DataTypes.TEXT,

      about: DataTypes.TEXT,
      date1: DataTypes.TEXT,
      date2: DataTypes.TEXT,
      alies: DataTypes.TEXT,

      address: DataTypes.TEXT,
      name: DataTypes.TEXT,
photo: DataTypes.TEXT('medium'),
      photos: DataTypes.TEXT,

      mailer: DataTypes.TEXT,
      mailer2: DataTypes.TEXT,
      mailer3: DataTypes.TEXT,
      mailer4: DataTypes.TEXT,

      mailer5: DataTypes.TEXT,
      mailer6: DataTypes.TEXT,
      mailer7: DataTypes.TEXT,
      mailer8: DataTypes.TEXT,

      mailer9: DataTypes.TEXT,

      sms: DataTypes.TEXT,
      sms2: DataTypes.TEXT,
      sms3: DataTypes.TEXT,


      price: DataTypes.TEXT,
      phone: DataTypes.TEXT,
      serviceCode: DataTypes.STRING,
      version: DataTypes.TINYINT,
      balanceChecker: DataTypes.BOOLEAN,
      billing: DataTypes.BOOLEAN,

      logo: DataTypes.TEXT,
      verif: DataTypes.TEXT,
      screen: DataTypes.TEXT,
      screen2: DataTypes.TEXT,
      screen3: DataTypes.TEXT,
      screen4: DataTypes.TEXT,
      call: DataTypes.TEXT,


      color: DataTypes.TEXT,
      favicon: DataTypes.TEXT,
      language: DataTypes.TEXT,

      firstActionAt: DataTypes.DATE,
      firstSmsActionAt: DataTypes.DATE,
      type: DataTypes.TEXT,

pendingRedirect: DataTypes.TEXT,

    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Ad",
    }
  );
  return Ad;
};
