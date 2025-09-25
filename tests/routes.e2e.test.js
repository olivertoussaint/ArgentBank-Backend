// tests/routes.e2e.test.js
const request = require("supertest");
const app = require("../server/app");
const mongoose = require("mongoose");
const User = require("../server/database/models/userModel"); // chemin correct

// Utilisateur de test
const TEST_USER = {
  email: "e2e.tester@argentbank.dev",
  password: "SuperPassw0rd!",
  firstName: "E2E",
  lastName: "Tester",
};

let token;

describe("🌐 End-to-End Route Tests", () => {
  beforeAll(async () => {
    // Attendre que la connexion Mongo lancée par l'app soit prête
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        const onConnected = () => {
          mongoose.connection.off("error", onError);
          resolve();
        };
        const onError = (err) => {
          mongoose.connection.off("connected", onConnected);
          reject(err);
        };
        mongoose.connection.once("connected", onConnected);
        mongoose.connection.once("error", onError);
      });
    }

    // S'assurer que l'utilisateur existe via l'API (gère le hash, etc.)
    // Si déjà créé, le signup peut renvoyer 409/400 selon ton implémentation → on ignore.
    try {
      await request(app).post("/api/v1/user/signup").send({
        email: TEST_USER.email,
        password: TEST_USER.password,
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName,
      });
    } catch (_) {
      // no-op
    }

    // Se connecter pour obtenir le token
    const loginRes = await request(app).post("/api/v1/user/login").send({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    // Selon tes contrôleurs, la structure semble être { message, body: { token, user } }
    expect(loginRes.status).toBeGreaterThanOrEqual(200);
    expect(loginRes.status).toBeLessThan(400);
    expect(loginRes.body).toBeDefined();
    expect(loginRes.body.body).toBeDefined();
    expect(loginRes.body.body.token).toBeDefined();

    token = loginRes.body.body.token;
  });

  afterAll(async () => {
    // NE PAS dropDatabase() ici (ça casse les autres suites).
    // On peut nettoyer cet utilisateur pour limiter les collisions, sans couper la connexion.
    try {
      await User.deleteOne({ email: TEST_USER.email });
    } catch (_) {
      // no-op
    }
  });

  test("🔒 GET /profile requires auth", async () => {
    // Sans token → 401 ou 403 (selon ton middleware)
    const resNoAuth = await request(app).get("/api/v1/profile");
    expect([401, 403]).toContain(resNoAuth.status);

    // Avec token → 200 attendu (ou 204 si aucun body)
    const res = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);

    expect([200]).toContain(res.status);
    if (res.status === 200) {
      // Le contrôleur renvoie normalement le user
      expect(res.body).toBeDefined();
      // certaines implémentations enveloppent les données dans body.body.user
      const user =
        res.body.body?.user || res.body.user || res.body?.data || res.body;
      expect(user).toBeDefined();
      expect(user.email).toBe(TEST_USER.email);
    }
  });

  test("📝 PUT /profile updates data", async () => {
    const payload = { firstName: "E2E-Updated", lastName: "Tester-Updated" };

    const res = await request(app)
      .put("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    // La plupart des implémentations renvoient 200 + user mis à jour
    expect([200, 204]).toContain(res.status);

    if (res.status === 200) {
      const updated =
        res.body?.body?.user || res.body?.user || res.body?.data || res.body;
      expect(updated).toBeDefined();
      if (updated.firstName) expect(updated.firstName).toBe(payload.firstName);
      if (updated.lastName) expect(updated.lastName).toBe(payload.lastName);
    } else if (res.status === 204) {
      // si pas de body, on peut relire pour vérifier
      const check = await request(app)
        .get("/api/v1/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(check.status).toBe(200);
      const user =
        check.body?.body?.user ||
        check.body?.user ||
        check.body?.data ||
        check.body;
      expect(user).toBeDefined();
      if (user.firstName) expect(user.firstName).toBe(payload.firstName);
      if (user.lastName) expect(user.lastName).toBe(payload.lastName);
    }
  });
});
