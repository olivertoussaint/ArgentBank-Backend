// server/database/connection.js
const mongoose = require("mongoose");
const { DATABASE_URL } = require("../config"); 

module.exports = async function dbConnection() {
  console.log("🔌 Connecting MongoDB...");
  await mongoose.connect(DATABASE_URL); // mongoose >= 7: pas d'options legacy
};
