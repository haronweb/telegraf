"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Service.init(
    {
      title: DataTypes.STRING,
      shortlink: DataTypes.STRING,
      domain: DataTypes.STRING,
      zone: DataTypes.STRING,
      shortlinkZone: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      currencyCode: DataTypes.STRING,
      lang: DataTypes.STRING,
      translate: DataTypes.JSON,
      countryCode: DataTypes.STRING,
      code: DataTypes.STRING,
      mailer: DataTypes.BOOLEAN,
      mailer2: DataTypes.BOOLEAN,
      mailer3: DataTypes.BOOLEAN,
      mailer4: DataTypes.BOOLEAN,
      mailer5: DataTypes.BOOLEAN,
      mailer6: DataTypes.BOOLEAN,
      mailer7: DataTypes.BOOLEAN,
      mailer8: DataTypes.BOOLEAN,
      mailer9: DataTypes.BOOLEAN,

      sms: DataTypes.BOOLEAN,
      sms2: DataTypes.BOOLEAN,
      sms3: DataTypes.BOOLEAN,

      screen: DataTypes.BOOLEAN,
      screen2: DataTypes.BOOLEAN,
      screen3: DataTypes.BOOLEAN,
      screen4: DataTypes.BOOLEAN,

      // text: DataTypes.STRING,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Service",
    }
  );
  return Service;
};
