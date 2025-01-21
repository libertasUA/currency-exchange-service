/* eslint-disable global-require */
/* eslint-disable security/detect-non-literal-require */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require("sequelize");
const { db } = require("../config/config");

const sequelize = new Sequelize(db.database, db.username, db.password, db);

const models = {
  sequelize,
  Sequelize,
  Currency: require("./currency")(sequelize, Sequelize.DataTypes),
  ExchangeRate: require("./exchangeRate")(sequelize, Sequelize.DataTypes),
  Account: require("./account")(sequelize, Sequelize.DataTypes),
  TransactionPackage: require("./transactionPackage")(
    sequelize,
    Sequelize.DataTypes
  ),
  Transaction: require("./transaction")(sequelize, Sequelize.DataTypes),
  AccountTurnover: require("./accountTurnover")(sequelize, Sequelize.DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
