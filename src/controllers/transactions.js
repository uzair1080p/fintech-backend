const { aggregateUserData, updateMatches } = require("../services/aggregate");
const logger = require("../logger").child(__filename);
const { Account, Transaction, Processor } = require("../models");
const { getTransactions } = require("../services/plaid");

const listTransactions = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { accountId, processorId, limit, offset } = req.query;
    const transactions = await Transaction.getTransactionList(
      userId,
      accountId,
      processorId,
      limit ? limit : 200,
      offset ? offset : 0
    );
    res.success(Transaction.serialize(transactions));
  } catch (err) {
    next(err);
  }
};

Object.assign(listTransactions, {
  description: "Returns an array of transactions",
  required: {},
  optional: {
    accountId: "string",
    processorId: "string",
    limit: "integer",
    offset: "integer",
  },
  authenticated: true,
  returns: "array",
});

const TSYS_MATCH = "TSYS/TRANSFIRST";
const BANKCARD_MATCH = "BANKCARD DEP";
const TRUEBILL_MATCH = "Truebill";

const updateTransaction = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { transactionId } = req.params;
    const body = req.body;
    const transaction = await Transaction.findByTransactionId(
      transactionId,
      userId
    );
    const updated = await transaction.updateTransaction(body);
    if (body.processorId) {
      const tsys = updated.name.includes(TSYS_MATCH);
      const bank = updated.name.includes(BANKCARD_MATCH);
      const truebill = updated.name.includes(TRUEBILL_MATCH);
      const processor = await Processor.findById(body.processorId, userId);
      if (!processor.matchString) {
        if (tsys) {
          processor.set("matchString", TSYS_MATCH);
        } else if (bank) {
          processor.set("matchString", BANKCARD_MATCH);
        } else if (truebill) {
          processor.set("matchString", TRUEBILL_MATCH);
        }
        const processorUpdated = await processor.save();
        if (processorUpdated.matchString) {
          await updateMatches(processorUpdated);
        }
      }
    }

    res.success(updated.serialize());
  } catch (err) {
    next(err);
  }
};

Object.assign(updateTransaction, {
  description: "Updates an existing processor",
  required: {},
  optional: {
    processorId: "string",
  },
  authenticated: true,
  returns: "object",
});

const plaidWebhook = async (req, res, next) => {
  try {
    const { webhook_type } = req.body;

    switch (webhook_type) {
      case "TRANSACTIONS":
        await handleTransactionWebhook(req);
        break;
      default:
        console.log("Unsupported webhook", webhook_type, req.body);
        break;
    }

    res.success();
  } catch (err) {
    next(err);
  }
};

Object.assign(plaidWebhook, {
  description: "Plaid Only - Do Not Implement",
  required: {},
  optional: {},
  authenticated: true,
  returns: "object",
});

const handleTransactionWebhook = async (req) => {
  const user = req.user;
  const { webhook_code, item_id, removed_transactions } = req.body;
  const account = await Account.findByPlaidItemId(item_id, user.id);
  const processors = await Processor.getProcessorList(user.id);
  let txs;
  switch (webhook_code) {
    case "INITIAL_UPDATE":
    case "DEFAULT_UPDATE":
      txs = await getTransactions(account, 1);
      await Transaction.createTransactions(
        user.id,
        account.id,
        txs.transactions,
        processors
      );
      break;
    case "HISTORICAL_UPDATE":
      txs = await getTransactions(account);
      await Transaction.createTransactions(
        user.id,
        account.id,
        txs.transactions,
        processors
      );
      break;
    case "TRANSACTIONS_REMOVED":
      await Transaction.removeTransactions(removed_transactions);
      break;
    default:
      break;
  }

  // TODO  - run user aggregation on transaction updates to tally up the results
  // await aggregateUserData(user);
};

module.exports = { listTransactions, updateTransaction, plaidWebhook };
