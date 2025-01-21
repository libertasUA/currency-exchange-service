"use strict";
const { Model } = require("sequelize");

const { transactionType } = require("../constants");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.TransactionPackage, {
        foreignKey: "transactionPackageID",
        as: "transactionPackage",
      });
      Transaction.belongsTo(models.Currency, {
        foreignKey: "currency",
      });
      Transaction.belongsTo(models.AccountTurnover, {
        foreignKey: "transactionId",
        as: "accountTurnover",
      });
    }
  }
  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transactionPackageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: Object.values(transactionType),
      },
      currency: {
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
      modelName: "Transaction",
    }
  );
  return Transaction;
};
