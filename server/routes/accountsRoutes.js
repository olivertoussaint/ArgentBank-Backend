// server/routes/accountsRoutes.js
const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transactionsController");

// Logs DEV
router.use((req, res, next) => {

  next();
});

// Liste des comptes
router.get("/", transactionsController.getAllAccounts);

// Un compte par ID
router.get("/:id", transactionsController.getAccountById);

// Transactions d’un compte
router.get(
  "/:id/transactions",
  transactionsController.getTransactionsByAccount
);

// Détail d’une transaction
router.get(
  "/:id/transactions/:txId",
  transactionsController.getTransactionDetail
);

module.exports = router;
