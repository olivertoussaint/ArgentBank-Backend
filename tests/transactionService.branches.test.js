// tests/transactionService.branches.test.js
const svc = require("../server/services/transactionService");

// ⚠️ Adapte le chemin si besoin : c'est le modèle que ton service interroge
jest.mock("../server/database/models/transactionModel", () => ({
  find: jest.fn(),
}));
const Transaction = require("../server/database/models/transactionModel");

describe("transactionService - branches coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAccountTransactions → throw si aucune transaction", async () => {
    Transaction.find.mockResolvedValueOnce([]);
    await expect(svc.getAccountTransactions("acc_empty")).rejects.toThrow(
      /No transactions found/i
    );
    expect(Transaction.find).toHaveBeenCalledWith({ accountId: "acc_empty" });
  });

   test("getTransactionDetail → renvoie null si txId absent dans la liste (comportement actuel du service)", async () => {
    Transaction.find.mockResolvedValueOnce([{ id: "tx1" }, { id: "tx2" }]);
     await expect(svc.getTransactionDetail("acc1", "missing"))
   .resolves.toBeNull();
 expect(Transaction.find).toHaveBeenCalledWith({ accountId: "acc1" });
 });

  test("getTransactionDetail → renvoie la bonne transaction", async () => {
    const target = { id: "tx42", amount: 99.5 };
    Transaction.find.mockResolvedValueOnce([{ id: "x" }, target, { id: "y" }]);
    await expect(svc.getTransactionDetail("acc1", "tx42")).resolves.toEqual(
      target
    );
    expect(Transaction.find).toHaveBeenCalledWith({ accountId: "acc1" });
  });
});
