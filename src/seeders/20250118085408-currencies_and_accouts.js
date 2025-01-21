"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = await fetch(
      "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"
    );
    const currencies = await data.json();

    const currenciesData = currencies.map(({ cc, txt }) => ({
      code: cc,
      name: txt,
    }));
    currenciesData.push({ code: "UAH", name: "Українська гривня" });

    await queryInterface.bulkInsert("Currencies", currenciesData, {});

    const accountsData = currencies.map(({ cc }) => ({
      currencyCode: cc,
      balance: 1000,
    }));
    accountsData.push({ currencyCode: "UAH", balance: 1000 });

    await queryInterface.bulkInsert("Accounts", accountsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Accounts", null, {});
    await queryInterface.bulkDelete("Currencies", null, {});
  },
};
