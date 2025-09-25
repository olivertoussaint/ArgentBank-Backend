const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Transaction = require('../database/models/transactionModel'); 

// Chemin vers le fichier JSON contenant les transactions
const filePath = path.join(__dirname, '../data/transactions.json');

// Fonction pour importer les transactions
const importTransactions = async () => {
  try {
    // Connexion à la base de données MongoDB
    await mongoose.connect('mongodb://localhost/argentBankDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Charger les données depuis le fichier JSON
    const transactions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Insérer les données dans la collection "transactions"
    const insertedTransactions = await Transaction.insertMany(transactions);

    console.log(`${insertedTransactions.length} transactions imported successfully`);
    process.exit(0); // Quitter le script
  } catch (error) {
    console.error('Error importing transactions:', error);
    process.exit(1); // Quitter avec un code d'erreur
  }
};

// Exécuter la fonction
importTransactions();
