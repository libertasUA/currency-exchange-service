"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateString = `${year}${month}${day}`;

    const data = await fetch(
      `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${dateString}&json`
    );
    const currencyRates = await data.json();

    const formatDate = (date) => {
      const [day, month, year] = date.split(".");
      return `${year}-${month}-${day}`;
    };

    const adjustRate = (rate) => {
      const percentageChange = (Math.random() * 10 - 5) / 100;
      return rate + rate * percentageChange;
    };

    await queryInterface.bulkInsert(
      "ExchangeRates",
      currencyRates.map(({ cc, rate, exchangedate }) => {
        const sellRate = adjustRate(rate);
        const buyRate = sellRate + 1;

        return {
          currencyCode: cc,
          nbuRate: rate,
          sellRate,
          buyRate,
          exchangeDate: formatDate(exchangedate),
        };
      }),
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ExchangeRates", null, {});
  },
};
