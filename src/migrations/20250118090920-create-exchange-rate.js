"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ExchangeRates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      currencyCode: {
        type: Sequelize.STRING,
        references: {
          model: "Currencies",
          key: "code",
        },
        notAllowNull: false,
      },
      nbuRate: {
        type: Sequelize.DECIMAL(15, 2),
        notAllowNull: false,
      },
      sellRate: {
        type: Sequelize.DECIMAL(15, 2),
        notAllowNull: false,
      },
      buyRate: {
        type: Sequelize.DECIMAL(15, 2),
        notAllowNull: false,
      },
      exchangeDate: {
        type: Sequelize.DATEONLY,
        notAllowNull: false,
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
    await queryInterface.dropTable("ExchangeRates");
  },
};
