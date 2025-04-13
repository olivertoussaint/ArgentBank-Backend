const express = require('express');
const userRoutes = require('./userRoutes');
const transactionsRoutes = require('./transactionsRoutes');
const accountsRoutes = require('./accountsRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

// User-related routes
router.use('/user', userRoutes);

// Account-related routes, including transactions for specific accounts
router.use('/accounts', accountsRoutes);

// General transaction routes (if needed)
router.use('/transactions', transactionsRoutes);

module.exports = router;
