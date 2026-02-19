require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./src/config/db");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`✅ API corriendo en http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Error arrancando server:", err);
    process.exit(1);
  }
})();
