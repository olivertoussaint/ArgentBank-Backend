const express = require("express");
const router = express.Router();
const User = require("../database/models/userModel");
const transactionController = require("../controllers/transactionsController");
const tokenValidation = require("../middleware/tokenValidation");

const transactionsData = [
  {
    accountId: "1",
    transactions: [
      {
        id: "1",
        accountId: 1,
        date: "2020-06-20",
        amount: 5.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("1", 2082.79),
      },
      {
        id: "2",
        accountId: 1,
        date: "2020-06-20",
        amount: 10.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("1", 2087.79),
      },
      {
        id: "3",
        accountId: 1,
        date: "2020-06-20",
        amount: 20.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("1", 2097.79),
      },
      {
        id: "4",
        accountId: 1,
        date: "2020-06-20",
        amount: 30.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("1", 2117.79),
      },
      {
        id: "5",
        accountId: 1,
        date: "2020-06-20",
        amount: 40.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("1", 2147.79),
      },
      {
        id: "6",
        accountId: 1,
        date: "2020-06-20",
        amount: 50.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("1", 2187.79),
      },
    ],
  },
  {
    accountId: "2",
    transactions: [
      {
        id: "7",
        accountId: 2,
        date: "2020-06-21",
        amount: 5.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("2", 10928.42),
      },
      {
        id: "8",
        accountId: 2,
        date: "2020-06-21",
        amount: 10.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("2", 10938.42),
      },
      {
        id: "9",
        accountId: 2,
        date: "2020-06-21",
        amount: 20.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("2", 10958.42),
      },
      {
        id: "10",
        accountId: 2,
        date: "2020-06-21",
        amount: 30.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("2", 10988.42),
      },
      {
        id: "11",
        accountId: 2,
        date: "2020-06-21",
        amount: 40.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("2", 11028.42),
      },
      {
        id: "12",
        accountId: 2,
        date: "2020-06-21",
        amount: 50.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("2", 11078.42),
      },
    ],
  },
  {
    accountId: "3",
    transactions: [
      {
        id: "13",
        accountId: 3,
        date: "2020-06-22",
        amount: 5.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("3", 184.3),
      },
      {
        id: "14",
        accountId: 3,
        date: "2020-06-22",
        amount: 10.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("3", 194.3),
      },
      {
        id: "15",
        accountId: 3,
        date: "2020-06-22",
        amount: 20.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("3", 214.3),
      },
      {
        id: "16",
        accountId: 3,
        date: "2020-06-22",
        amount: 30.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("3", 244.3),
      },
      {
        id: "17",
        accountId: 3,
        date: "2020-06-22",
        amount: 50.0,
        description: "Golden Sun Bakery",
        balance: formatBalance("3", 294.3),
      },
    ],
  },
];

function formatBalance(accountId, balance) {
  return parseFloat(balance.toFixed(2));
}

// Fetch all accounts
router.get(
  "/",
  tokenValidation.validateToken,
  transactionController.getAccountTransactions
);

router.get(
  "/:accountId",
  // tokenValidation.validateToken,
  transactionController.getAccountTransactions
);

// Fetch transactions for a specific account
router.get("/:accountId/transactions", (req, res) => {
  const { accountId } = req.params;
  const account = transactionsData.find((acc) => acc.accountId === accountId);

  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  res.json(account.transactions);
});

// Fetch a specific transaction for an account
router.get("/:accountId/transactions/:transactionId", (req, res) => {
  const { accountId, transactionId } = req.params;
  const account = transactionsData.find((acc) => acc.accountId === accountId);

  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  const transaction = account.transactions.find(
    (item) => item.id === transactionId
  );

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  res.json(transaction);
});

module.exports = router;
