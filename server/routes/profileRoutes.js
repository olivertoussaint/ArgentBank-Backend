// server/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { validateToken } = require("../middleware");
const userController = require("../controllers/userController");

router.get("/", validateToken, userController.getUserProfile);
router.put("/", validateToken, userController.updateUserProfile);

// ✅ compat front OC: token dans le body + POST
router.post("/", validateToken, userController.getUserProfile);

module.exports = router;
