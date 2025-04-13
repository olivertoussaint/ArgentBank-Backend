const Account = require("../database/models/accountModel");
const Transaction = require("../database/models/transactionModel");

module.exports = {
  // Fetch all accounts
  getAllAccounts: async (req, res) => {
    try {
      const accounts = await Account.find().populate("transactions");
      res.status(200).json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Fetch details for a specific account
  getAccountById: async (req, res) => {
    const { accountId } = req.params;
    try {
      const account = await Account.findOne({ accountId }).populate("transactions");
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.status(200).json(account);
    } catch (error) {
      console.error("Error fetching account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Fetch transactions for a specific account
  getAccountTransactions: async (req, res) => {
    const { accountId } = req.params;
    try {
      const transactions = await Transaction.find({ accountId });
      if (!transactions.length) {
        return res.status(404).json({ error: "No transactions found for this account" });
      }
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Fetch a specific transaction for an account
  getTransactionById: async (req, res) => {
    const { accountId, transactionId } = req.params;
    try {
      const transaction = await Transaction.findOne({ accountId, id: transactionId });
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.status(200).json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
