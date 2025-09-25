// tests/auth.401.test.js
const express = require("express");
const request = require("supertest");

// On mock le middleware pour renvoyer 401
jest.mock("../server/middleware", () => ({
  validateToken: (_req, res, _next) => {
    return res.status(401).json({ message: "Unauthorized" });
  },
}));

// On importe les routes profil (protégées)
const profileRoutes = require("../server/routes/profileRoutes");

describe("Auth 401 - protected route", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1/profile", profileRoutes);
  });

  test("GET /api/v1/profile → 401 Unauthorized quand token invalide/absent", async () => {
    const res = await request(app).get("/api/v1/profile");
    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.stringMatching(/unauthorized/i),
      })
    );
  });
});
