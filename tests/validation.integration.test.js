const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server/app");

const base = "/api/v1/users";

function uniqueEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`;
}

afterAll(async () => {
  // ferme proprement la connexion mongoose ouverte par app
  await mongoose.connection.close();
});

describe("🔎 Validation d'entrées - /users", () => {
  it("❌ signup - refuse un email invalide", async () => {
    const res = await request(app).post(`${base}/signup`).send({
      email: "not-an-email",
      password: "Passw0rd123",
      firstName: "John",
      lastName: "Doe",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid email");
  });

  it("❌ signup - refuse un mot de passe faible", async () => {
    const res = await request(app).post(`${base}/signup`).send({
      email: uniqueEmail(),
      password: "short", // faible
      firstName: "John",
      lastName: "Doe",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Weak password/i);
  });

  it("❌ signup - refuse prénom/nom vides", async () => {
    const res = await request(app).post(`${base}/signup`).send({
      email: uniqueEmail(),
      password: "Passw0rd123",
      firstName: "",
      lastName: "  ",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("First name and last name are required");
  });

  it("✅ signup - accepte des entrées valides", async () => {
    const res = await request(app).post(`${base}/signup`).send({
      email: uniqueEmail(),
      password: "Passw0rd123",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/created/i);
    // res.body.body contient l'utilisateur créé selon ton controller
    expect(res.body.body).toHaveProperty("email");
  });

  it("❌ update profile - refuse firstName/lastName vides", async () => {
    // 1) créer un utilisateur + login pour obtenir un token
    const email = uniqueEmail();
    await request(app).post(`${base}/signup`).send({
      email,
      password: "Passw0rd123",
      firstName: "Jane",
      lastName: "Doe",
    });

    const login = await request(app).post(`${base}/login`).send({
      email,
      password: "Passw0rd123",
    });
    expect(login.statusCode).toBe(200);
    const token = login.body.body?.token || login.body.token;

    // 2) tenter update avec champs invalides
    const res = await request(app)
      .put(`${base}/profile`)
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "", lastName: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("First name and last name are required");
  });

  it("✅ update profile - accepte des entrées valides", async () => {
    const email = uniqueEmail();
    await request(app).post(`${base}/signup`).send({
      email,
      password: "Passw0rd123",
      firstName: "Jane",
      lastName: "Doe",
    });

    const login = await request(app).post(`${base}/login`).send({
      email,
      password: "Passw0rd123",
    });
    const token = login.body.body?.token || login.body.token;

    const res = await request(app)
      .put(`${base}/profile`)
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "New", lastName: "Name" });

    expect(res.statusCode).toBe(200);
    // Selon ton controller, user est dans body.user ou directement dans body
    const user =
      res.body.body?.user || res.body.body || res.body.user || res.body;
    expect(user).toHaveProperty("firstName", "New");
    expect(user).toHaveProperty("lastName", "Name");
  });
});
