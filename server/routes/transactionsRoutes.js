const express = require('express');
const router = express.Router();


const transactionsData = [
  {
    accountId: '1',
    transactions: [
      { id: '1', date: '2020-06-20', amount: 5.00, description: 'Golden Sun Bakery', balance: 2082.79 },
      { id: '2', date: '2020-06-20', amount: 10.00, description: 'Golden Sun Bakery', balance: 2087.79 },
      { id: '3', date: '2020-06-20', amount: 20.00, description: 'Golden Sun Bakery', balance: 2097.79 },
      { id: '4', date: '2020-06-20', amount: 30.00, description: 'Golden Sun Bakery', balance: 2117.79 },
      { id: '5', date: '2020-06-20', amount: 40.00, description: 'Golden Sun Bakery', balance: 2147.79 },
      { id: '6', date: '2020-06-20', amount: 50.00, description: 'Golden Sun Bakery', balance: 2187.79 },
    ],
  },
  {
    accountId: '2',
    transactions: [
      { id: '7', date: '2020-06-20', amount: 5.00, description: 'Golden Sun Bakery', balance: 2082.79 },
      { id: '8', date: '2020-06-20', amount: 10.00, description: 'Golden Sun Bakery', balance: 2087.79 },
      { id: '9', date: '2020-06-20', amount: 20.00, description: 'Golden Sun Bakery', balance: 2097.79 },
      { id: '10', date: '2020-06-20', amount: 30.00, description: 'Golden Sun Bakery', balance: 2117.79 },
      { id: '11', date: '2020-06-20', amount: 40.00, description: 'Golden Sun Bakery', balance: 2147.79 },
      { id: '12', date: '2020-06-20', amount: 50.00, description: 'Golden Sun Bakery', balance: 2187.79 },
      
    ],
  },
];

// Route GET pour récupérer les transactions en fonction de accountId
router.get('/:accountId/transactions', (req, res) => {
  const { accountId } = req.params;
  const account = transactionsData.find((acc) => acc.accountId === accountId);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json(account.transactions);
});

module.exports = router;
