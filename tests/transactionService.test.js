const service = require("../server/services/transactionService");

describe("transactionService.getAccountTransactions (avec DI)", () => {
  const fakeAccountId = "abc123";

  // 👇 Un mock propre : find est un jest.fn()
  const MockTransaction = { find: jest.fn() };

  beforeEach(() => {
    // On réinitialise à chaque test
    MockTransaction.find.mockReset();

    // On injecte le modèle mocké dans le service
    service.__setTransactionModel(MockTransaction);
  });

  it("devrait retourner une liste de transactions", async () => {
    const rows = [{ id: "1", accountId: fakeAccountId, amount: 100 }];

    // ✅ Résolution normale
    MockTransaction.find.mockResolvedValue(rows);

    await expect(
      service.getAccountTransactions(fakeAccountId)
    ).resolves.toEqual(rows);

    expect(MockTransaction.find).toHaveBeenCalledWith({
      accountId: String(fakeAccountId),
    });
  });

  it("devrait lancer une erreur si aucune transaction trouvée", async () => {
    // ✅ Résolution avec liste vide
    MockTransaction.find.mockResolvedValue([]);

    await expect(service.getAccountTransactions(fakeAccountId)).rejects.toThrow(
      "No transactions found for this account"
    );
  });

  it("devrait lancer une erreur si MongoDB échoue", async () => {
    // ✅ Rejet simulant une panne DB — MAIS dans le test, pas au chargement !
    MockTransaction.find.mockImplementation(() =>
      Promise.reject(new Error("MongoDB down"))
    );

    await expect(service.getAccountTransactions(fakeAccountId)).rejects.toThrow(
      "Failed to fetch transactions"
    );
  });
});
