const express = require("express");
const { auth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");
const {
  createTenantTicket,
  listTenantTickets,
  listLandlordTickets,
  getTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");

const router = express.Router();

// Tenant endpoints
router.post("/tenant/tickets", auth, requireRole("landlord"), createTenantTicket);
router.get("/tenant/tickets", auth, requireRole("landlord"), listTenantTickets);

// Landlord endpoints
router.get("/tickets", auth, requireRole("landlord"), listLandlordTickets);
router.get("/tickets/:id", auth, requireRole("landlord"), getTicket);
router.put("/tickets/:id", auth, requireRole("landlord"), updateTicket);
router.delete("/tickets/:id", auth, requireRole("landlord"), deleteTicket);

module.exports = router;