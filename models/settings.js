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
      loggingGroupId: DataTypes.BIGINT,
      cf_mail: DataTypes.TEXT,
      cf_api: DataTypes.TEXT,
      cf_id: DataTypes.TEXT,
      cf_id_domain: DataTypes.TEXT,
      domain: DataTypes.TEXT,
      shortlink: DataTypes.TEXT,
      shortlinkZone: DataTypes.TEXT,


      supportChatId: DataTypes.TEXT,

      logsGroupId: DataTypes.BIGINT,
            privateLogsGroupId:DataTypes.BIGINT,

      allGroupId: DataTypes.BIGINT,
      requestsGroupId: DataTypes.BIGINT,
      payoutsChannelId: DataTypes.BIGINT,
      accountingChannelId: DataTypes.BIGINT,

      requestsEnabled: DataTypes.BOOLEAN,
      allLogsEnabled: DataTypes.BOOLEAN,
      allHelloMsgEnabled: DataTypes.BOOLEAN,
      allGroupLink: DataTypes.STRING,
      payoutsChannelLink: DataTypes.STRING,
      payoutPercent: DataTypes.DECIMAL(36, 2),
                  referralPercent: DataTypes.DECIMAL(36, 2),

      work: DataTypes.BOOLEAN,
      info: DataTypes.TEXT,
      cookie: DataTypes.TEXT,
      auto_clean_db: DataTypes.BOOLEAN,
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      sequelize,
      modelName: "Settings",
    }
  );
  return Settings;
};
