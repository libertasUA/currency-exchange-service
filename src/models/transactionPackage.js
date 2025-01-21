"use strict";
const { Model } = require("sequelize");

const { exchangeOperationType } = require("../constants");

module.exports = (sequelize, DataTypes) => {
  class TransactionPackage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TransactionPackage.belongsTo(models.Currency, {
        foreignKey: "baseCurrency",
      });

      TransactionPackage.belongsTo(models.Currency, {
        foreignKey: "targetCurrency",
      });
    }
  }
  TransactionPackage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      baseCurrency: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      targetCurrency: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          return parseFloat(this.getDataValue("amount")) || 0.0;
        },
      },
      operationType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: Object.values(exchangeOperationType),
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "TransactionPackage",
    }
  );
  return TransactionPackage;
};
