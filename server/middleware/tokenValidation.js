// server/middleware/tokenValidation.js
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

module.exports.validateToken = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const tokenFromHeader = auth.startsWith("Bearer ")
    ? auth.slice(7).trim()
    : null;
  const tokenFromBody = req.body && (req.body.token || req.body?.body?.token);
  const tokenFromQuery = req.query && req.query.token;

  const token = tokenFromHeader || tokenFromBody || tokenFromQuery;

  if (!token) {
    return res.status(401).json({ status: 401, message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const userId = payload.id || payload.sub;
    if (!userId)
      return res
        .status(401)
        .json({ status: 401, message: "Invalid token payload" });

    req.user = { id: userId, tokenPayload: payload };
    return next();
  } catch (e) {
    return res
      .status(401)
      .json({ status: 401, message: "Invalid or expired token" });
  }
};
