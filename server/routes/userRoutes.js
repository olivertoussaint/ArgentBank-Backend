// server/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { validateToken } = require("../middleware");
const {
  validateSignup,
  validateProfileUpdate,
} = require("../middleware/validators");

// Auth / inscription
router.post("/signup", validateSignup, userController.createUser); // ✅ ajoute la validation
router.post("/login", userController.loginUser);

// Profil (Argent Bank spec : POST read, PUT update)
router.post("/profile", validateToken, userController.getUserProfile);
router.put(
  "/profile",
  validateToken,
  validateProfileUpdate,
  userController.updateUserProfile
);

module.exports = router;
