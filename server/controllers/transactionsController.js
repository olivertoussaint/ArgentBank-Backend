const transactionService = require('../services/transactionService');

module.exports.getAccountTransactions = async (req, res) => {
  let response = {};

  try {
    const { accountId } = req.params; // Récupère l'accountId depuis la requête
    console.log("Account ID:", accountId); // Debug: Vérifier l'accountId

    const transactions = await transactionService.getAccountTransactions(accountId);
    response.status = 200;
    response.message = 'Transactions retrieved successfully';
    response.body = transactions;
  } catch (error) {
    console.error("Error in getAccountTransactions:", error.message); // Debug
    response.status = 500;
    response.message = 'Failed to fetch transactions';
  }

  return res.status(response.status).json(response);
};
