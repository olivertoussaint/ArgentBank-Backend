const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
