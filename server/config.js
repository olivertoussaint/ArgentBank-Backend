const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3001,
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost/argentBankDB",
  SECRET_KEY: process.env.SECRET_KEY || "default-secret-key",
};
