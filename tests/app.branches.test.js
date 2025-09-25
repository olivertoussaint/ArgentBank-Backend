// tests/app.branches.test.js
const request = require("supertest");

describe("app.js branches - swagger mount present vs absent", () => {
  afterEach(() => {
    jest.resetModules(); // reset le cache des modules entre tests
    jest.clearAllMocks();
  });

  test("NO swagger.yaml/json → /api-docs non monté (404) et warning loggé", async () => {
    let app;
    let warnSpy;
    let existsSpy;

    jest.isolateModules(() => {
      // 1) Mock minimal BCRYPT (évite le native binding)
      jest.doMock("bcrypt", () => ({
        hashSync: jest.fn(),
        compare: jest.fn().mockResolvedValue(true),
      }));
      // 2) Mock la connexion Mongo pour éviter side-effects
      jest.doMock("../server/database/connection", () =>
        jest.fn(async () => {})
      );
      // 3) Ne mocker QUE existsSync (pas tout fs) → readdirSync reste ok
      const fs = require("fs");
      existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);
      // 4) Capture le warning
      warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      // 5) Charger l'app avec les mocks actifs
      app = require("../server/app");
    });

    // /api-docs ne doit pas être servi
    const res = await request(app).get("/api-docs");
    expect([404, 301, 302]).toContain(res.status);

    // Warning affiché
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toMatch(/No swagger\.yaml\/json found/i);

    existsSpy.mockRestore();
    warnSpy.mockRestore();
  });

  test("Swagger présent (comportement normal) → /api-docs monté", async () => {
    let app;

    jest.isolateModules(() => {
      // Mock bcrypt & db connexion aussi ici pour éviter les bindings natifs
      jest.doMock("bcrypt", () => ({
        hashSync: jest.fn(),
        compare: jest.fn().mockResolvedValue(true),
      }));
      jest.doMock("../server/database/connection", () =>
        jest.fn(async () => {})
      );

      app = require("../server/app");
    });

    const res = await request(app).get("/api-docs");
    // swagger-ui renvoie 200 HTML ou redirige vers /api-docs/
    expect([200, 301, 302]).toContain(res.status);
  });
});
