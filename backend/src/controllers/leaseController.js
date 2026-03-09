const Lease = require("../models/Lease");
const Property = require("../models/Property");
const Unit = require("../models/Unit");
const Tenant = require("../models/Tenant");

// POST /api/leases
async function createLease(req, res) {
  const {
    unitId,
    tenantId,
    startDate,
    endDate,
    monthlyRent,
    deposit,
    dueDay,
    status,
    notes
  } = req.body;

  if (!unitId || !tenantId || !startDate || !endDate || monthlyRent === undefined) {
    return res.status(400).json({
      message: "Faltan campos: unitId, tenantId, startDate, endDate, monthlyRent"
    });
  }

  // Validar que el Unit sea del landlord
  const unit = await Unit.findOne({ _id: unitId, ownerId: req.user.id });
  if (!unit) return res.status(404).json({ message: "Unidad no encontrada" });

  // Validar que la Property sea del landlord (extra seguridad)
  const property = await Property.findOne({ _id: unit.propertyId, ownerId: req.user.id });
  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });

  // Validar tenant del landlord
  const tenant = await Tenant.findOne({ _id: tenantId, ownerId: req.user.id });
  if (!tenant) return res.status(404).json({ message: "Tenant no encontrado" });

  try {
    const lease = await Lease.create({
      ownerId: req.user.id,
      propertyId: unit.propertyId,
      unitId,
      tenantId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      monthlyRent: Number(monthlyRent),
      deposit: deposit ? Number(deposit) : 0,
      dueDay: dueDay ? Number(dueDay) : 1,
      status: status || "active",
      notes: notes || ""
    });

    // (Opcional) marcar unit como occupied si el lease está activo
    if ((status || "active") === "active") {
      await Unit.updateOne({ _id: unitId, ownerId: req.user.id }, { $set: { status: "occupied" } });
    }

    return res.status(201).json({ lease });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Esta unidad ya tiene un lease activo" });
    }
    console.error(err);
    return res.status(500).json({ message: "Error creando lease" });
  }
}

// GET /api/leases
async function listLeases(req, res) {
  const leases = await Lease.find({ ownerId: req.user.id })
    .populate("propertyId", "name address")
    .populate("unitId", "unitNumber rent status")
    .populate("tenantId", "fullName email phone")
    .sort({ createdAt: -1 });

  return res.json({ leases });
}

// GET /api/leases/:id
async function getLease(req, res) {
  const lease = await Lease.findOne({ _id: req.params.id, ownerId: req.user.id })
    .populate("propertyId", "name address")
    .populate("unitId", "unitNumber rent status")
    .populate("tenantId", "fullName email phone");

  if (!lease) return res.status(404).json({ message: "Lease no encontrado" });
  return res.json({ lease });
}

// PUT /api/leases/:id
async function updateLease(req, res) {
  const allowed = ["startDate", "endDate", "monthlyRent", "deposit", "dueDay", "status", "notes"];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      if (k === "startDate" || k === "endDate") updates[k] = new Date(req.body[k]);
      else if (["monthlyRent", "deposit", "dueDay"].includes(k)) updates[k] = Number(req.body[k]);
      else updates[k] = req.body[k];
    }
  }

  const lease = await Lease.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    { $set: updates },
    { new: true }
  );

  if (!lease) return res.status(404).json({ message: "Lease no encontrado" });

  // Si se cambia a ended, puedes marcar la unidad como vacant (opcional)
  if (updates.status === "ended") {
    await Unit.updateOne({ _id: lease.unitId, ownerId: req.user.id }, { $set: { status: "vacant" } });
  }

  return res.json({ lease });
}

// DELETE /api/leases/:id
async function deleteLease(req, res) {
  const lease = await Lease.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!lease) return res.status(404).json({ message: "Lease no encontrado" });

  // Opcional: si era active, marcar unit como vacant
  if (lease.status === "active") {
    await Unit.updateOne({ _id: lease.unitId, ownerId: req.user.id }, { $set: { status: "vacant" } });
  }

  return res.json({ message: "Lease eliminado" });
}

module.exports = { createLease, listLeases, getLease, updateLease, deleteLease };