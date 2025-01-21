"use strict";
/** @type {import('sequelize-cli').Migration} */

const { exchangeOperationType } = require("../constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TransactionPackages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      baseCurrency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        references: {
          model: "Currencies",
          key: "code",
        },
      },
      targetCurrency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        references: {
          model: "Currencies",
          key: "code",
        },
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      operationType: {
        type: Sequelize.ENUM({
          values: Object.keys(exchangeOperationType),
        }),
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TransactionPackages");
  },
};
