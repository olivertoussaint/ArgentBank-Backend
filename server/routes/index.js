// server/routes/index.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the Argent Bank API [DEV MODE]",
    status: "OK",
  });
});

const routesPath = __dirname;
const SKIP = new Set(["index.js"]); // ← si tu laisses app.js monter /profile, ajoute "profileRoutes.js" ici
const OVERRIDES = { user: "/users" }; // userRoutes.js => /users

fs.readdirSync(routesPath).forEach((file) => {
  if (SKIP.has(file) || !file.endsWith("Routes.js")) return;

  const base = file.replace("Routes.js", "");
  const key = base.toLowerCase();
  const routePrefix = OVERRIDES[key] || `/${key}`;

  const routeModule = require(path.join(routesPath, file));
  router.use(routePrefix, routeModule);
});

module.exports = router;
