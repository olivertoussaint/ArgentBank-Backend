// server/services/userService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../database/models/userModel");
const { SECRET_KEY } = require("../config");
const MESSAGES = require("../utils/messages");

const SALT_ROUNDS = 10;

const err = (status, message) => {
  const e = new Error(message);
  e.status = status;
  return e;
};
const toPublicUser = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  delete o.password;
  o.id = o.id || o._id?.toString?.();
  return o;
};

module.exports.createUser = async ({
  email,
  password,
  firstName,
  lastName,
}) => {
  try {
    // email unique (insensible à la casse)
    const existing = await User.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });
    if (existing) throw err(409, MESSAGES.USER_EXISTS);

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
      accounts: [],
    });

    return toPublicUser(user);
  } catch (error) {
    if (!error.status) error.status = 400;
    throw error;
  }
};

module.exports.loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw err(404, MESSAGES.USER_NOT_FOUND);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw err(401, MESSAGES.INVALID_PASSWORD);

    // payload: id cohérent avec le middleware
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "24h" });

    return { token, user: toPublicUser(user) };
  } catch (error) {
    if (!error.status) error.status = 401;
    throw error;
  }
};

module.exports.getUserProfile = async (userIdOrReq) => {
  try {
    // ✅ Compat tests: autoriser un objet req-like { headers: { authorization: 'Bearer …' } }
    if (
      userIdOrReq &&
      typeof userIdOrReq === "object" &&
      userIdOrReq.headers?.authorization
    ) {
      const auth = userIdOrReq.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
      if (!token) throw err(401, "Token is missing from header");
      const payload = jwt.verify(token, SECRET_KEY);
      const id = payload.id || payload.sub;
      const user = await User.findById(id);
      if (!user) throw err(404, MESSAGES.USER_NOT_FOUND);
      return toPublicUser(user);
    }

    // ✅ Sinon: on considère que c’est directement un userId
    const user = await User.findById(userIdOrReq);
    if (!user) throw err(404, MESSAGES.USER_NOT_FOUND);
    return toPublicUser(user);
  } catch (error) {
    if (!error.status) error.status = 400;
    throw error;
  }
};

module.exports.updateUserProfile = async (userIdOrReq, updates = {}) => {
  try {
    let userId;
    let patchSource;

    // 🔹 Cas: l'appel est fait avec un req-like (test ou route)
    if (
      userIdOrReq &&
      typeof userIdOrReq === "object" &&
      userIdOrReq.headers &&
      (userIdOrReq.headers.authorization || userIdOrReq.headers.Authorization)
    ) {
      const authHeader =
        userIdOrReq.headers.authorization ||
        userIdOrReq.headers.Authorization ||
        "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : "";
      if (!token) throw err(401, "Token is missing from header");

      const { id } = jwt.verify(token, SECRET_KEY);
      userId = id;
      patchSource = userIdOrReq.body || {};
    } else {
      // 🔹 Cas: l'appel est fait directement avec l'ID
      userId = userIdOrReq;
      patchSource = updates || {};
    }

    const { firstName, lastName } = patchSource;
    const patch = {};
    if (typeof firstName === "string") patch.firstName = firstName;
    if (typeof lastName === "string") patch.lastName = lastName;

    const user = await User.findByIdAndUpdate(userId, patch, { new: true });
    if (!user) throw err(404, MESSAGES.USER_NOT_FOUND);

    return toPublicUser(user);
  } catch (error) {
    if (!error.status) error.status = 400;
    throw error;
  }
};
