// tests/transactionService.more.test.js
// On utilise l’injection déjà prévue (__setTransactionModel)
const svc = require("../server/services/transactionService");

describe("transactionService - compléments", () => {
  afterEach(() => {
    // on remet le modèle à un faux modèle "neutre"
    svc.__setTransactionModel({ find: jest.fn() });
    jest.clearAllMocks();
  });

  test("getAccountTransactions -> renvoie erreur 'Failed to fetch transactions' si find() jette", async () => {
    const Mock = {
      find: jest.fn(() => Promise.reject(new Error("Mongo fail"))),
    };
    svc.__setTransactionModel(Mock);

    await expect(svc.getAccountTransactions("1")).rejects.toThrow(
      "Failed to fetch transactions"
    );
  });

  test("getAccountTransactions -> renvoie erreur 'No transactions...' si tableau vide", async () => {
    const Mock = { find: jest.fn(() => Promise.resolve([])) };
    svc.__setTransactionModel(Mock);

    await expect(svc.getAccountTransactions("1")).rejects.toThrow(
      "No transactions found for this account"
    );
  });

  test("getAccountTransactions -> OK si tableau plein", async () => {
    const txs = [{ id: "a" }];
    const Mock = { find: jest.fn(() => Promise.resolve(txs)) };
    svc.__setTransactionModel(Mock);

    const res = await svc.getAccountTransactions("1");
    expect(res).toEqual(txs);
  });
});
