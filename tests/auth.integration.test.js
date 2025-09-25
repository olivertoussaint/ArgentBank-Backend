const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server/app"); // On importe app, pas server.js qui lance le serveur
const User = require("../server/database/models/userModel"); // Chemin corrigé

describe("🧪 Auth Integration", () => {
  const userData = {
    email: "testuser@example.com",
    password: "securepassword123",
    firstName: "Test",
    lastName: "User",
  };

  // ✅ Pas de mongoose.connect ici — déjà fait via app.js

  afterEach(async () => {
    // Nettoyage fin de test
    await User.deleteMany({ email: userData.email });
  });

  afterAll(async () => {
    // Fermeture propre de la connexion
    await mongoose.connection.close();
  });

  it("✅ should register a new user", async () => {
    const res = await request(app).post("/api/v1/user/signup").send(userData);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User successfully created");
    expect(res.body.body).toHaveProperty("email", userData.email);
  });

  it("🚫 should fail login with wrong password", async () => {
    await request(app).post("/api/v1/user/signup").send(userData);

    const res = await request(app)
      .post("/api/v1/user/login")
      .send({ email: userData.email, password: "wrongpassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password is invalid");
  });

  it("✅ should login successfully with correct credentials", async () => {
    await request(app).post("/api/v1/user/signup").send(userData);

    const res = await request(app)
      .post("/api/v1/user/login")
      .send({ email: userData.email, password: userData.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.body).toHaveProperty("token");
    expect(res.body.body).toHaveProperty("user");
    expect(res.body.body.user).toHaveProperty("email", userData.email);
  });
});
