const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  balance: { type: Number, required: true },
  accountId: { type: Number, required: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);
