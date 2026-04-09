const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./src/routes/authRoutes");
const propertyRoutes = require("./src/routes/propertyRoutes");
const unitRoutes = require("./src/routes/unitRoutes");
const tenantRoutes = require("./src/routes/tenantRoutes");
const leaseRoutes = require("./src/routes/leaseRoutes");
const ticketRoutes = require("./src/routes/ticketRoutes");
const tenantPortalRoutes = require("./src/routes/tenantPortalRoutes");
const webhookRoutes = require("./src/routes/webhookRoutes");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

// WEBHOOKS PÚBLICOS (antes de rutas protegidas)
app.use("/api/webhooks", webhookRoutes);

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api", unitRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api", ticketRoutes);
app.use("/api", tenantPortalRoutes);

// fallback
app.use((req, res) =>
  res.status(404).json({ message: "Ruta no encontrada" })
);

module.exports = app;