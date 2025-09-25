// server/middleware/validators.js

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(email) {
  // Assez strict pour nos besoins
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(pwd) {
  // min 8, au moins 1 lettre et 1 chiffre
  return (
    typeof pwd === "string" &&
    pwd.length >= 8 &&
    /[A-Za-z]/.test(pwd) &&
    /\d/.test(pwd)
  );
}

/* -------------------------- SIGNUP BODY VALIDATION ------------------------- */
function validateSignup(req, res, next) {
  const { email, password, firstName, lastName } = req.body || {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ status: 400, message: "Invalid email" });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      status: 400,
      message: "Weak password (min 8 chars, letters and numbers)",
    });
  }
  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    return res.status(400).json({
      status: 400,
      message: "First name and last name are required",
    });
  }

  next();
}

/* ----------------------- PROFILE UPDATE BODY VALIDATION -------------------- */
function validateProfileUpdate(req, res, next) {
  const { firstName, lastName } = req.body || {};
  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    return res.status(400).json({
      status: 400,
      message: "First name and last name are required",
    });
  }
  next();
}

module.exports = {
  validateSignup,
  validateProfileUpdate,
};
