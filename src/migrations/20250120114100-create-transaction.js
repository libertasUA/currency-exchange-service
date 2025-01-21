"use strict";
/** @type {import('sequelize-cli').Migration} */

const { transactionType } = require("../constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      transactionPackageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "TransactionPackages",
          key: "id",
        },
      },

      type: {
        type: Sequelize.ENUM({
          values: Object.keys(transactionType),
        }),
        allowNull: false,
      },
      currency: {
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
    await queryInterface.dropTable("Transactions");
  },
};
