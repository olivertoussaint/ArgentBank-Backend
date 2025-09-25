// tests/app.misc.test.js
const request = require("supertest");
const app = require("../server/app");

// 🔇 Réduire le bruit console
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.warn.mockRestore();
  console.error.mockRestore();
});

describe("App misc endpoints", () => {
  it("GET /health -> 200 { ok: true }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /route-inconnue -> 404 { error: 'Route not found' }", async () => {
    const res = await request(app).get("/this/does/not/exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Route not found" });
  });
});
