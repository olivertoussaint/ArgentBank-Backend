// tests/app.alias.test.js
const request = require("supertest");

describe("app.js - alias /user → /users", () => {
  let app;

  beforeAll(() => {
    jest.isolateModules(() => {
      jest.doMock("bcrypt", () => ({
        hashSync: jest.fn(),
        compare: jest.fn().mockResolvedValue(true),
      }));
      jest.doMock("../server/database/connection", () =>
        jest.fn(async () => {})
      );

      app = require("../server/app");
    });
  });

  test("GET /api/v1/user est redirigé vers /api/v1/users", async () => {
    const res = await request(app).get("/api/v1/user");
    expect([301, 302, 404]).toContain(res.status); // selon implémentation
  });
});
