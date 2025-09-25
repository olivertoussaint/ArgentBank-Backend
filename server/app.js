// server/app.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");

const dbConnection = require("./database/connection");
const { applyMiddleware } = require("./middleware"); // doit configurer cors, express.json(), logger, etc.
const apiRoutes = require("./routes");

const app = express();

/* ------------------------- Connexion MongoDB ------------------------- */
dbConnection().catch((e) => {
  console.error("MongoDB connection failed:", e.message);
  process.exit(1); // on stoppe si la BDD n'est pas dispo
});

/* ---------------------------- Middlewares ---------------------------- */
applyMiddleware(app); 

/* ----------------------------- Healthcheck --------------------------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ------------------------------- Routes ------------------------------ */

app.use("/api/v1", apiRoutes);

// Alias pour compatibilité front (redirige /user vers /users)
app.use("/api/v1/user", (req, res, next) => {
  req.url = `/users${req.url}`;
  next();
}, apiRoutes);
/* ------------------------------ Swagger ------------------------------ */
const swaggerPathYaml = path.resolve(process.cwd(), "swagger.yaml");
const swaggerPathJson = path.resolve(process.cwd(), "swagger.json");

let swaggerDocs = null;

if (fs.existsSync(swaggerPathYaml)) {
  swaggerDocs = yaml.load(swaggerPathYaml);
} else if (fs.existsSync(swaggerPathJson)) {
  swaggerDocs = require(swaggerPathJson);
}

if (swaggerDocs) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  app.get("/api-docs.json", (_req, res) => res.json(swaggerDocs));
} else {
  console.warn("⚠️  No swagger.yaml/json found — skipping /api-docs");
}


/* -------------------------------- Root ------------------------------- */
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the Argent Bank API!",
    availableEndpoints: ["/api/v1/...", "/api-docs"],
  });
});

/* -------------------------------- 404 -------------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* --------------------------- Error handling -------------------------- */
// IMPORTANT: middleware d’erreurs à 4 arguments
app.use((err, req, res, _next) => {
  const status = err.status || err.code || 500;
  const message = err.message || "Something went wrong!";
  res.status(status).json({ status, error: message });
});

module.exports = app;
