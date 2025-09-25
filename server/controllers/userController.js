// server/controllers/userController.js
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");
const MESSAGES = require("../utils/messages");
const { SECRET_KEY } = require("../config");

// Helpers
const ok = (message, body = {}) => ({ status: 200, message, body });
const sendError = (res, err, fallback = 400) => {
  const status = err?.status || err?.code || fallback;
  const message = err?.message || "Unexpected error";
  return res.status(status).json({ status, message });
};

/**
 * POST /api/v1/users/signup
 * body: { email, password, firstName, lastName }
 * -> { status:200, message:"User successfully created", body:{ email, ... } }
 */
async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body);

    const flat = {
      id: user.id || user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accounts: user.accounts || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res
      .status(200)
      .json(ok(MESSAGES?.USER_CREATED || "User successfully created", flat));
  } catch (err) {
    return sendError(res, err, 400);
  }
}

/**
 * POST /api/v1/users/login
 * body: { email, password }
 * -> { status:200, message:"Login successful", body:{ token, user } }
 */
async function loginUser(req, res) {
  try {
    const result = await userService.loginUser(req.body);

    // Le service renvoie normalement { token, user }
    let token = result?.token;
    let user = result?.user || result;

    if (!token) {
      token = jwt.sign(
        { id: user.id || user._id, email: user.email },
        SECRET_KEY,
        { expiresIn: "24h" }
      );
    }

    return res.status(200).json(
      ok(MESSAGES?.LOGIN_SUCCESS || "Login successful", {
        token,
        user,
      })
    );
  } catch (err) {
    // Les tests attendent 400 si mauvais mot de passe
    if (err?.message === "Password is invalid") err.status = 400;
    return sendError(res, err, 400);
  }
}

/**
 * GET /api/v1/profile  (ou POST /api/v1/profile si alias)
 * header: Authorization: Bearer <token>
 * -> { status:200, message, body:{ user } }
 */
async function getUserProfile(req, res) {
  try {
    const userId = req.user?.id; // injecté par validateToken
    const user = await userService.getUserProfile(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: MESSAGES?.USER_NOT_FOUND || "User not found",
      });
    }
    return res.status(200).json(
      ok(
        MESSAGES?.PROFILE_FETCH_SUCCESS ||
          "User profile retrieved successfully",
        {
          user,
        }
      )
    );
  } catch (err) {
    return sendError(res, err, 400);
  }
}

/**
 * PUT /api/v1/profile
 * body: { firstName?, lastName? }
 * -> { status:200, message, body:{ user } }
 */
async function updateUserProfile(req, res) {
  try {
    const userId = req.user?.id;
    const user = await userService.updateUserProfile(userId, req.body || {});
    return res.status(200).json(
      ok(
        MESSAGES?.PROFILE_UPDATE_SUCCESS || "User profile updated successfully",
        {
          user,
        }
      )
    );
  } catch (err) {
    return sendError(res, err, 400);
  }
}

module.exports = {
  createUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
