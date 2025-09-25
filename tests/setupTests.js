// tests/setupTests.js
afterAll(async () => {
  // Ferme proprement Mongoose S'IL est ouvert
  const mongoose = require("mongoose");
  try {
    if (
      mongoose.connection?.readyState &&
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.connection.close();
    }
  } catch (e) {
    // on ignore, c’est juste un cleanup
  }
});

// Si tu utilises des timers dans tes tests, ça aide aussi :
afterAll(() => {
  jest.useRealTimers();
});
