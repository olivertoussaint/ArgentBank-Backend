const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  balance: { type: Number, required: true }
});

const accountSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à l'utilisateur
    transactions: [transactionSchema] // Tableau de transactions
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
