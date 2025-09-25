// server/middleware/index.js
const express = require("express");
const cors = require("cors");

const { validateToken } = require("./tokenValidation");

/**
 * Middlewares applicatifs globaux
 */
function applyMiddleware(app) {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

}

module.exports = {
  applyMiddleware,
  validateToken, // on ré-exporte le vrai middleware JWT
};
