const Joi = require("joi");

const { exchangeOperationType } = require("../constants");
console.log(Object.values(exchangeOperationType).join(","));

const createExchange = {
  body: Joi.object().keys({
    baseCurrency: Joi.string().required().valid("UAH"),
    targetCurrency: Joi.string().required(),
    amount: Joi.number().positive().required(),
    operationType: Joi.string().valid("sell", "buy").required(),
  }),
};

module.exports = {
  createExchange,
};
