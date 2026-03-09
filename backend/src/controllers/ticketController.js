const Ticket = require("../models/Ticket");
const Tenant = require("../models/Tenant");
const Unit = require("../models/Unit");
const Property = require("../models/Property");
const Lease = require("../models/Lease");

// =========================
// TENANT
// =========================

// POST /api/tenant/tickets
async function createTenantTicket(req, res) {
  const { tenantId, unitId, title, description, category, priority } = req.body;

  if (!tenantId || !unitId || !title || !description) {
    return res.status(400).json({
      message: "Faltan campos: tenantId, unitId, title, description",
    });
  }

  const tenant = await Tenant.findOne({
    _id: tenantId,
    ownerId: req.user.id,
  });

  if (!tenant) {
    return res.status(404).json({ message: "Tenant no encontrado" });
  }

  const unit = await Unit.findOne({
    _id: unitId,
    ownerId: req.user.id,
  });

  if (!unit) {
    return res.status(404).json({ message: "Unidad no encontrada" });
  }

  const property = await Property.findOne({
    _id: unit.propertyId,
    ownerId: req.user.id,
  });

  if (!property) {
    return res.status(404).json({ message: "Propiedad no encontrada" });
  }

  const lease = await Lease.findOne({
    tenantId,
    unitId,
    ownerId: req.user.id,
    status: "active",
  });

  const ticket = await Ticket.create({
    ownerId: req.user.id,
    tenantId,
    propertyId: property._id,
    unitId,
    leaseId: lease ? lease._id : null,
    title,
    description,
    category: category || "general",
    priority: priority || "medium",
    status: "open",
    source: "dashboard",
  });

  return res.status(201).json({ ticket });
}

// GET /api/tenant/tickets
async function listTenantTickets(req, res) {
  const { tenantId } = req.query;

  if (!tenantId) {
    return res.status(400).json({ message: "Falta tenantId en query" });
  }

  const tenant = await Tenant.findOne({
    _id: tenantId,
    ownerId: req.user.id,
  });

  if (!tenant) {
    return res.status(404).json({ message: "Tenant no encontrado" });
  }

  const tickets = await Ticket.find({
    tenantId,
    ownerId: req.user.id,
  })
    .populate("propertyId", "name address")
    .populate("unitId", "unitNumber")
    .sort({ createdAt: -1 });

  return res.json({ tickets });
}

// =========================
// LANDLORD
// =========================

// GET /api/tickets
async function listLandlordTickets(req, res) {
  const tickets = await Ticket.find({ ownerId: req.user.id })
    .populate("tenantId", "fullName email phone")
    .populate("propertyId", "name address")
    .populate("unitId", "unitNumber")
    .populate("leaseId", "monthlyRent status")
    .sort({ createdAt: -1 });

  return res.json({ tickets });
}

// GET /api/tickets/:id
async function getTicket(req, res) {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  })
    .populate("tenantId", "fullName email phone")
    .populate("propertyId", "name address")
    .populate("unitId", "unitNumber")
    .populate("leaseId", "monthlyRent status");

  if (!ticket) {
    return res.status(404).json({ message: "Ticket no encontrado" });
  }

  return res.json({ ticket });
}

// PUT /api/tickets/:id
async function updateTicket(req, res) {
  const allowed = ["title", "description", "category", "priority", "status", "notes"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    { $set: updates },
    { new: true }
  );

  if (!ticket) {
    return res.status(404).json({ message: "Ticket no encontrado" });
  }

  return res.json({ ticket });
}

// DELETE /api/tickets/:id
async function deleteTicket(req, res) {
  const ticket = await Ticket.findOneAndDelete({
    _id: req.params.id,
    ownerId: req.user.id,
  });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket no encontrado" });
  }

  return res.json({ message: "Ticket eliminado" });
}

module.exports = {
  createTenantTicket,
  listTenantTickets,
  listLandlordTickets,
  getTicket,
  updateTicket,
  deleteTicket,
};