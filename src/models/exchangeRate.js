"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ExchangeRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ExchangeRate.belongsTo(models.Currency, {
        foreignKey: "currencyCode",
      });
    }
  }
  ExchangeRate.init(
    {
      currencyCode: DataTypes.STRING,
      nbuRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          return parseFloat(this.getDataValue("nbuRate")) || 0.0;
        },
      },
      sellRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          return parseFloat(this.getDataValue("sellRate")) || 0.0;
        },
      },
      buyRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          return parseFloat(this.getDataValue("buyRate")) || 0.0;
        },
      },
      exchangeDate: DataTypes.DATEONLY,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATEONLY,
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
      modelName: "ExchangeRate",
    }
  );
  return ExchangeRate;
};
