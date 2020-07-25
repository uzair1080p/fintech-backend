const { Transaction } = require("../models");

exports.aggregateUserData = async (user) => {
  const transactions = await Transaction.getTransactionList(user.id);

  const deposits = transactions.filter(isDepositTx).map((tx) => {
    // TODO get user payment processors and determine which processor owns this tx
    const processor = {
      name: "Stripe",
      feePercent: 2.9,
    };
    const beforeFeeAmount = Math.round(
      tx.amount / (1 - processor.feePercent / 100)
    );
    return { ...tx.serialize(), processor, beforeFeeAmount };
  });

  if (deposits.length === 0) {
    return;
  }

  const averageFeePercent = Math.round(
    (deposits.reduce(calcAverageFeePercent, 0) / deposits.length) * 100
  );
  const totalFees = Math.abs(Math.round(deposits.reduce(calcTotalFees, 0)));
  const totalIncome = Math.abs(Math.round(deposits.reduce(calcTotalIncome, 0)));
  const rating = calcRating(averageFeePercent);
  const update = {
    averageFeePercent,
    totalFees,
    totalIncome,
    rating,
    numTransactions: deposits.length,
  };
  await user.updateUserAggregate(update);
};

exports.updateMatches = async (processor) => {
  const transactions = await Transaction.getTransactionList(processor.userId);
  await Promise.all(
    transactions
      .filter(
        (tx) => !tx.processorId && tx.name.includes(processor.matchString)
      )
      .map((tx) => {
        tx.set("processorId", processor.id);
        return tx.save();
      })
  );
};

const isDepositTx = (tx) =>
  !tx.pending && tx.type === "special" && tx.amount < 0;

const calcAverageFeePercent = (acc, tx) => acc + tx.processor.feePercent;

const calcTotalFees = (acc, tx) => acc + (tx.beforeFeeAmount - tx.amount);

const calcTotalIncome = (acc, tx) => acc + tx.amount;

const calcRating = (score) => {
  let rating = "-";
  if (score >= 0 && score <= 233) {
    rating = "A";
  } else if (score > 233 && score <= 267) {
    rating = "B";
  } else if (score > 267 && score <= 300) {
    rating = "C";
  } else if (score > 300 && score <= 375) {
    rating = "D";
  } else if (score > 375) {
    rating = "F";
  }
  return rating;
};
