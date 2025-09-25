// server/controllers/transactionsController.js
const svc = require("../services/transactionService");

async function getAllAccounts(req, res) {
  try {
    const accounts = await svc.getAllAccounts();
    return res
      .status(200)
      .json({ accounts: Array.isArray(accounts) ? accounts : [] });
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Error" });
  }
}

async function getAccountById(req, res) {
  try {
    const { id } = req.params; // ✅ bien récupérer l’ID
    const account = await svc.getAccountById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    return res.status(200).json({ account });
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Error" });
  }
}

async function getTransactionsByAccount(req, res) {
  try {
    const { id } = req.params; // ✅ bien récupérer l’ID
    const txs = await svc.getAccountTransactions(id);
    return res.status(200).json({ accountId: String(id), transactions: txs });
  } catch (e) {
    if (e?.message === "No transactions found for this account") {
      return res.status(404).json({ message: e.message });
    }
    return res.status(500).json({ message: e?.message || "Error" });
  }
}

async function getTransactionDetail(req, res) {
  try {
    const { id, txId } = req.params; // ✅ bien récupérer id + txId
    const tx = await svc.getTransactionDetail(id, txId);
    return res.status(200).json({ accountId: String(id), transaction: tx });
  } catch (err) {
    if (err?.message && /not found/i.test(err.message)) {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ message: err?.message || "Error" });
  }
}

module.exports = {
  getAllAccounts,
  getAccountById,
  getTransactionsByAccount,
  getTransactionDetail,
};
