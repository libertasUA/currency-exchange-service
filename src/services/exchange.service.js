const { default: httpStatus } = require("http-status");
const ApiError = require("../utils/ApiError");

const {
  sequelize,
  Account,
  ExchangeRate,
  TransactionPackage,
  Transaction,
  AccountTurnover,
} = require("../models");

const { transactionType, exchangeOperationType } = require("../constants");

const checkHaveAccountAmount = ({
  baseCurrencyBalance,
  turgetCurrencyBalance,
  exchangeAmount,
  buyRate,
  operationType,
}) => {
  if (operationType === exchangeOperationType.BUY) {
    if (baseCurrencyBalance < exchangeAmount * buyRate) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Insufficient funds for the buy operation"
      );
    }
  } else if (operationType === exchangeOperationType.SELL) {
    if (turgetCurrencyBalance < exchangeAmount) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Insufficient funds for the sell operation"
      );
    }
  }
};

const getAccountsForExchange = async (baseCurrencyCode, targetCurrencyCode) => {
  const [baseAccount, targetAccount] = await Promise.all([
    Account.findOne({ where: { currencyCode: baseCurrencyCode } }),
    Account.findOne({ where: { currencyCode: targetCurrencyCode } }),
  ]);
  if (!baseAccount || !targetAccount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Base or target currency account not found"
    );
  }

  return { baseAccount, targetAccount };
};

const formAccountTurnOverDataForBuyOperation = ({
  baseAccount,
  targetAccount,
  debitTransaction,
  creditTransaction,
  adjustmentTransaction,
}) => {
  const debitAccount = targetAccount;
  const creditAccount = baseAccount;

  let baseCurrencyAccountBalance = baseAccount.balance;
  let targetCurrencyAccountBalance = targetAccount.balance;

  const debitAccountTurnoverData = {
    openingBalance: targetCurrencyAccountBalance,
    accountId: debitAccount.id,
    debit: debitTransaction.amount,
    closingBalance: targetCurrencyAccountBalance + debitTransaction.amount,
  };

  targetCurrencyAccountBalance += debitTransaction.amount;

  const creditAccountTurnoverData = {
    openingBalance: baseCurrencyAccountBalance,
    accountId: creditAccount.id,
    credit: creditTransaction.amount,
    closingBalance: baseCurrencyAccountBalance - creditTransaction.amount,
  };

  baseCurrencyAccountBalance -= creditTransaction.amount;

  const adjustmentAccountTurnoverData = {
    accountId: baseAccount.id,
    openingBalance: baseCurrencyAccountBalance,
    debit: adjustmentTransaction.amount > 0 ? adjustmentTransaction.amount : 0,
    credit:
      adjustmentTransaction.amount < 0 ? -adjustmentTransaction.amount : 0,
    closingBalance: baseCurrencyAccountBalance + adjustmentTransaction.amount,
  };

  baseCurrencyAccountBalance += adjustmentTransaction.amount;

  return {
    debitAccountTurnoverData,
    creditAccountTurnoverData,
    adjustmentAccountTurnoverData,
    baseCurrencyAccountBalance,
    targetCurrencyAccountBalance,
  };
};

const formAccountTurnOverDataForSellOperation = ({
  baseAccount,
  targetAccount,
  debitTransaction,
  creditTransaction,
  adjustmentTransaction,
}) => {
  const debitAccount = baseAccount;
  const creditAccount = targetAccount;

  let baseCurrencyAccountBalance = baseAccount.balance;
  let targetCurrencyAccountBalance = targetAccount.balance;

  const debitAccountTurnoverData = {
    openingBalance: baseCurrencyAccountBalance,
    accountId: debitAccount.id,
    debit: debitTransaction.amount,
    closingBalance: baseCurrencyAccountBalance + debitTransaction.amount,
  };

  baseCurrencyAccountBalance += debitTransaction.amount;

  const creditAccountTurnoverData = {
    openingBalance: targetCurrencyAccountBalance,
    accountId: creditAccount.id,
    credit: creditTransaction.amount,
    closingBalance: targetCurrencyAccountBalance - creditTransaction.amount,
  };

  targetCurrencyAccountBalance -= creditTransaction.amount;

  const adjustmentAccountTurnoverData = {
    accountId: baseAccount.id,
    openingBalance: baseCurrencyAccountBalance,
    debit: adjustmentTransaction.amount > 0 ? adjustmentTransaction.amount : 0,
    credit:
      adjustmentTransaction.amount < 0 ? -adjustmentTransaction.amount : 0,
    closingBalance: baseCurrencyAccountBalance + adjustmentTransaction.amount,
  };
  baseCurrencyAccountBalance += adjustmentTransaction.amount;

  return {
    debitAccountTurnoverData,
    creditAccountTurnoverData,
    adjustmentAccountTurnoverData,
    baseCurrencyAccountBalance,
    targetCurrencyAccountBalance,
  };
};

// we calculate the equivalent of the base currency relative to the NBU rate
// the difference between the quantity at the NBU rate and the exchange buy rate will appear adjustment amount
const formAdjustmentTransactionDataForBuyOperation = ({
  baseCurrency,
  buyRate,
  nbuRate,
  exchangeAmount,
}) => {
  return {
    type: transactionType.ADJUSTMENT,
    currency: baseCurrency,
    amount: (nbuRate - buyRate) * exchangeAmount,
  };
};

// we get [base currency] relative [exchange amount] * [buy rate]
const formCreditTransactionDataForBuyOperation = ({
  baseCurrency,
  exchangeAmount,
  buyRate,
}) => {
  return {
    type: transactionType.CREDIT,
    currency: baseCurrency,
    amount: exchangeAmount * buyRate,
  };
};

// we receive [exchangeAmount] [target] currency
const formDebitTransactionDataForBuyOperation = ({
  targetCurrency,
  exchangeAmount,
}) => {
  return {
    type: transactionType.DEBIT,
    currency: targetCurrency,
    amount: exchangeAmount,
  };
};

const formInsertTransactionsDataForBuyOperation = ({
  baseAccount,
  targetAccount,
  exchangeRate,
  exchangeAmount,
}) => {
  const debitTransactionData = formDebitTransactionDataForBuyOperation({
    targetCurrency: targetAccount.currencyCode,
    exchangeAmount,
  });

  const creditTransactionData = formCreditTransactionDataForBuyOperation({
    baseCurrency: baseAccount.currencyCode,
    exchangeAmount,
    buyRate: exchangeRate.buyRate,
  });

  const adjustmentTransactionData =
    formAdjustmentTransactionDataForBuyOperation({
      baseCurrency: baseAccount.currencyCode,
      buyRate: exchangeRate.buyRate,
      nbuRate: exchangeRate.nbuRate,
      exchangeAmount,
    });

  return {
    debitTransactionData,
    creditTransactionData,
    adjustmentTransactionData,
  };
};

// we calculate the equivalent of the base currency relative to the NBU rate
// the difference between the quantity at the NBU rate and the exchange sell rate will appear adjustment amount
const formAdjustmentTransactionDataForSellOperation = ({
  baseCurrency,
  sellRate,
  nbuRate,
  exchangeAmount,
}) => {
  return {
    type: transactionType.ADJUSTMENT,
    currency: baseCurrency,
    amount: (sellRate - nbuRate) * exchangeAmount,
  };
};

// we get [exchange amount] [target] currency
const formCreditTransactionDataForSellOperation = ({
  targetCurrency,
  exchangeAmount,
}) => ({
  type: transactionType.DEBIT,
  currency: targetCurrency,
  amount: exchangeAmount,
});

// we receive calc [exchangeAmount] * [sell rate] [base] currency
const formDebitTransactionDataForSellOperation = ({
  baseCurrency,
  exchangeAmount,
  sellRate,
}) => ({
  type: transactionType.DEBIT,
  currency: baseCurrency,
  amount: exchangeAmount * sellRate,
});

const formInsertTransactionsDataForSellOperation = ({
  baseCurrency,
  targetCurrency,
  exchangeRate,
  exchangeAmount,
}) => {
  const debitTransactionData = formDebitTransactionDataForSellOperation({
    baseCurrency,
    exchangeAmount,
    sellRate: exchangeRate.sellRate,
  });

  const creditTransactionData = formCreditTransactionDataForSellOperation({
    targetCurrency,
    exchangeAmount,
  });

  const adjustmentTransactionData =
    formAdjustmentTransactionDataForSellOperation({
      baseCurrency: targetCurrency,
      sellRate: exchangeRate.sellRate,
      nbuRate: exchangeRate.nbuRate,
      exchangeAmount,
    });

  return {
    debitTransactionData,
    creditTransactionData,
    adjustmentTransactionData,
  };
};

/**
 * Create an exchange operation
 * @param {Object} exchangeBody
 * @returns {Promise<any>}
 */
const createExchange = async (exchangeBody) => {
  const { baseAccount, targetAccount } = await getAccountsForExchange(
    exchangeBody.baseCurrency,
    exchangeBody.targetCurrency
  );

  const exchangeRate = await ExchangeRate.findOne({
    where: { currencyCode: exchangeBody.targetCurrency },
  });
  if (!exchangeRate) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Exchange rate not found");
  }

  checkHaveAccountAmount({
    baseCurrencyBalance: baseAccount.balance,
    turgetCurrencyBalance: targetAccount.balance,
    exchangeAmount: exchangeBody.amount,
    buyRate: exchangeRate.buyRate,
    operationType: exchangeBody.operationType,
  });

  const t = await sequelize.transaction();
  try {
    const transactionPackage = await TransactionPackage.create(
      {
        baseCurrency: exchangeBody.baseCurrency,
        targetCurrency: exchangeBody.targetCurrency,
        amount: exchangeBody.amount,
        operationType: exchangeBody.operationType,
      },
      { transaction: t }
    );

    const {
      debitTransactionData,
      creditTransactionData,
      adjustmentTransactionData,
    } =
      exchangeBody.operationType === exchangeOperationType.BUY
        ? formInsertTransactionsDataForBuyOperation({
            baseAccount,
            targetAccount,
            exchangeRate,
            exchangeAmount: exchangeBody.amount,
          })
        : formInsertTransactionsDataForSellOperation({
            baseCurrency: exchangeBody.baseCurrency,
            targetCurrency: exchangeBody.targetCurrency,
            exchangeRate,
            exchangeAmount: exchangeBody.amount,
          });

    const {
      debitAccountTurnoverData,
      creditAccountTurnoverData,
      adjustmentAccountTurnoverData,
      baseCurrencyAccountBalance,
      targetCurrencyAccountBalance,
    } =
      exchangeBody.operationType === exchangeOperationType.BUY
        ? formAccountTurnOverDataForBuyOperation({
            baseAccount,
            targetAccount,
            debitTransaction: debitTransactionData,
            creditTransaction: creditTransactionData,
            adjustmentTransaction: adjustmentTransactionData,
          })
        : formAccountTurnOverDataForSellOperation({
            baseAccount,
            targetAccount,
            debitTransaction: debitTransactionData,
            creditTransaction: creditTransactionData,
            adjustmentTransaction: adjustmentTransactionData,
          });

    const [debitTransaction, creditTransaction, adjustmentTransaction] =
      await Transaction.bulkCreate(
        [
          {
            transactionPackageId: transactionPackage.id,
            ...debitTransactionData,
          },
          {
            transactionPackageId: transactionPackage.id,
            ...creditTransactionData,
          },
          {
            transactionPackageId: transactionPackage.id,
            ...adjustmentTransactionData,
          },
        ],
        { transaction: t }
      );

    await AccountTurnover.bulkCreate(
      [
        {
          transactionId: debitTransaction.id,
          ...debitAccountTurnoverData,
        },
        {
          transactionId: creditTransaction.id,
          ...creditAccountTurnoverData,
        },
        {
          transactionId: adjustmentTransaction.id,
          ...adjustmentAccountTurnoverData,
        },
      ],
      { transaction: t }
    );

    await Promise.all([
      Account.update(
        { balance: baseCurrencyAccountBalance },
        { where: { id: baseAccount.id }, transaction: t }
      ),
      Account.update(
        { balance: targetCurrencyAccountBalance },
        { where: { id: targetAccount.id }, transaction: t }
      ),
    ]);

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }

  return {
    message: "Exchange completed successfully",
  };
};

module.exports = {
  createExchange,
};
