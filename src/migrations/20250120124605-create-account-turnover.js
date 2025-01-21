"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AccountTurnovers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      accountId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Accounts",
          key: "id",
        },
      },
      transactionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Transactions",
          key: "id",
        },
      },

      openingBalance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      debit: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      credit: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
      closingBalance: {
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
    await queryInterface.dropTable("AccountTurnovers");
  },
};
