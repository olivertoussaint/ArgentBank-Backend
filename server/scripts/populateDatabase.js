const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const { DATABASE_URL, PORT } = require("../config"); 
const User = require("../database/models/userModel"); 

const SIGNUP_URL = `http://localhost:${PORT || 3001}/api/v1/user/signup`;

const users = [
  {
    firstName: "Tony",
    lastName: "Stark",
    email: "tony@stark.com",
    password: "password123",
  },
  {
    firstName: "Steve",
    lastName: "Rogers",
    email: "steve@rogers.com",
    password: "password456",
  },
];

(async function populate() {
  try {
    // 1) Connexion et reset propre de la collection users
    console.log("🔌 Connecting to Mongo:", DATABASE_URL);
    await mongoose.connect(DATABASE_URL);
    await User.deleteMany({});
    console.log("🗑️  Cleared collection: users");
    await mongoose.disconnect();

    // 2) Création via l'API (Axios)
    console.log("🚀 Creating users via API:", SIGNUP_URL);
    for (const u of users) {
      try {
        const res = await axios.post(SIGNUP_URL, u, { timeout: 8000 });
        console.log(
          `✅ Created: ${u.email} ->`,
          res.status,
          res.data?.message || "OK"
        );
      } catch (err) {
        console.error(
          `❌ Failed: ${u.email} ->`,
          err.response?.status || "",
          err.response?.data || err.message
        );
      }
    }

    console.log("✅ Populate finished.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Populate script failed:", err);
    process.exit(1);
  }
})();
