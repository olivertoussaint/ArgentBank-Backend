// tests/transactionController.test.js
const express = require("express");
const request = require("supertest");

// 🔇 Silencer les logs pour des sorties Jest propres
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});

// ✅ Mock du middleware d'auth pour bypasser le JWT
jest.mock("../server/middleware", () => ({
  validateToken: (req, _res, next) => {
    req.user = { id: "test-user" };
    next();
  },
}));

// ✅ Mock du service
jest.mock("../server/services/transactionService");
const svc = require("../server/services/transactionService");

// Import des routes (après mocks)
const accountsRoutes = require("../server/routes/accountsRoutes");

let app;
beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/accounts", accountsRoutes); // on monte juste la ressource testée
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("transactionsController (routes /accounts)", () => {
  test("GET /accounts -> 200 avec la liste des comptes", async () => {
    const fake = [{ id: "1", name: "Compte A" }];
    svc.getAllAccounts.mockResolvedValue(fake);

    const res = await request(app).get("/accounts");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ accounts: fake });
    expect(svc.getAllAccounts).toHaveBeenCalledTimes(1);
  });

  test("GET /accounts -> 500 si le service jette une erreur inconnue", async () => {
    svc.getAllAccounts.mockRejectedValue(new Error("DB exploded"));

    const res = await request(app).get("/accounts");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/db exploded|internal|error/i);
    expect(svc.getAllAccounts).toHaveBeenCalledTimes(1);
  });

  test("GET /accounts/:id -> 200 avec un compte", async () => {
    const account = { id: "1", name: "Compte A" };
    svc.getAccountById.mockResolvedValue(account);

    const res = await request(app).get("/accounts/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ account });
    expect(svc.getAccountById).toHaveBeenCalledWith("1");
  });

  test("GET /accounts/:id -> 404 si service renvoie null", async () => {
    svc.getAccountById.mockResolvedValue(null);

    const res = await request(app).get("/accounts/999");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found|introuv/i);
    expect(svc.getAccountById).toHaveBeenCalledWith("999");
  });

  test("GET /accounts/:id -> 500 si le service jette une erreur inconnue", async () => {
    svc.getAccountById.mockRejectedValue(new Error("DB exploded"));

    const res = await request(app).get("/accounts/42");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/db exploded|internal|error/i);
    expect(svc.getAccountById).toHaveBeenCalledWith("42");
  });

  test("GET /accounts/:id/transactions -> 200 avec transactions", async () => {
    const txs = [{ id: "t1" }, { id: "t2" }];
    svc.getAccountTransactions.mockResolvedValue(txs);

    const res = await request(app).get("/accounts/1/transactions");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ accountId: "1", transactions: txs });
    expect(svc.getAccountTransactions).toHaveBeenCalledWith("1");
  });

  test("GET /accounts/:id/transactions -> 404 si aucune transaction", async () => {
    svc.getAccountTransactions.mockRejectedValue(
      new Error("No transactions found for this account")
    );

    const res = await request(app).get("/accounts/1/transactions");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/No transactions/i);
    expect(svc.getAccountTransactions).toHaveBeenCalledWith("1");
  });

  test("GET /accounts/:id/transactions -> 500 si le service jette une erreur inconnue", async () => {
    svc.getAccountTransactions.mockRejectedValue(new Error("driver timeout"));

    const res = await request(app).get("/accounts/1/transactions");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/timeout|internal|error/i);
    expect(svc.getAccountTransactions).toHaveBeenCalledWith("1");
  });

  test("GET /accounts/:id/transactions/:txId -> 200 avec le détail", async () => {
    const tx = { id: "t9", amount: 42 };
    svc.getTransactionDetail.mockResolvedValue(tx);

    const res = await request(app).get("/accounts/1/transactions/t9");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ accountId: "1", transaction: tx });
    expect(svc.getTransactionDetail).toHaveBeenCalledWith("1", "t9");
  });

  test("GET /accounts/:id/transactions/:txId -> 404 si non trouvé", async () => {
    svc.getTransactionDetail.mockRejectedValue(
      new Error("Transaction not found")
    );

    const res = await request(app).get("/accounts/1/transactions/bad");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
    expect(svc.getTransactionDetail).toHaveBeenCalledWith("1", "bad");
  });

  test("GET /accounts/:id/transactions/:txId -> 500 si le service jette une erreur inconnue", async () => {
    svc.getTransactionDetail.mockRejectedValue(new Error("DB exploded"));

    const res = await request(app).get("/accounts/1/transactions/t1");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/db exploded|internal|error/i);
    expect(svc.getTransactionDetail).toHaveBeenCalledWith("1", "t1");
  });
});
