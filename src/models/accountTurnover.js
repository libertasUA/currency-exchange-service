"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AccountTurnover extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AccountTurnover.belongsTo(models.Account, {
        foreignKey: "accountId",
      });

      AccountTurnover.hasOne(models.Transaction, {
        foreignKey: "transactionId",
        sourceKey: "id",
        as: "transaction",
      });
    }
  }
  AccountTurnover.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      openingBalance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          return parseFloat(this.getDataValue("openingBalance")) || 0.0;
        },
      },
      debit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        get() {
          return parseFloat(this.getDataValue("debit")) || 0.0;
        },
      },
      credit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        get() {
          return parseFloat(this.getDataValue("credit")) || 0.0;
        },
      },
      closingBalance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          return parseFloat(this.getDataValue("closingBalance")) || 0.0;
        },
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("NOW"),
      },
    },
    {
      sequelize,
      modelName: "AccountTurnover",
    }
  );
  return AccountTurnover;
};
