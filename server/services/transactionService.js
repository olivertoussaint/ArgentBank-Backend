const Transaction = require('../database/models/transactionModel');

module.exports.getAccountTransactions = async (accountId) => {
  try {
    console.log("Fetching transactions for Account ID:", accountId); // Debug

    const transactions = await Transaction.find({ accountId });
    if (!transactions.length) {
      throw new Error("No transactions found for this account");
    }

    return transactions;
  } catch (error) {
    console.error("Error in transactionService.js:", error.message); // Debug
    throw new Error("Failed to fetch transactions");
  }
};
