const Property = require("../models/Property");
const Unit = require("../models/Unit");

// helper: valida que la propiedad sea del landlord
async function assertPropertyOwned(propertyId, ownerId) {
  const property = await Property.findOne({ _id: propertyId, ownerId });
  return property;
}

// POST /api/properties/:propertyId/units
async function createUnit(req, res) {
  const { propertyId } = req.params;
  const { unitNumber, bedrooms, bathrooms, rent, status, notes } = req.body;

  if (!unitNumber) {
    return res.status(400).json({ message: "Falta campo: unitNumber" });
  }

  const property = await assertPropertyOwned(propertyId, req.user.id);
  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });

  try {
    const unit = await Unit.create({
      ownerId: req.user.id,
      propertyId,
      unitNumber,
      bedrooms: bedrooms ?? 0,
      bathrooms: bathrooms ?? 0,
      rent: rent ?? 0,
      status: status || "vacant",
      notes: notes || ""
    });

    return res.status(201).json({ unit });
  } catch (err) {
    // duplicado por index unique
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Ya existe una unidad con ese número en esta propiedad" });
    }
    console.error(err);
    return res.status(500).json({ message: "Error creando unidad" });
  }
}

// GET /api/properties/:propertyId/units
async function listUnitsByProperty(req, res) {
  const { propertyId } = req.params;

  const property = await assertPropertyOwned(propertyId, req.user.id);
  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });

  const units = await Unit.find({ propertyId, ownerId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ units });
}

// PUT /api/units/:id
async function updateUnit(req, res) {
  const updates = {};
  const allowed = ["unitNumber", "bedrooms", "bathrooms", "rent", "status", "notes"];
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!unit) return res.status(404).json({ message: "Unidad no encontrada" });
    return res.json({ unit });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Ya existe una unidad con ese número en esta propiedad" });
    }
    console.error(err);
    return res.status(500).json({ message: "Error actualizando unidad" });
  }
}

// DELETE /api/units/:id
async function deleteUnit(req, res) {
  const unit = await Unit.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!unit) return res.status(404).json({ message: "Unidad no encontrada" });
  return res.json({ message: "Unidad eliminada" });
}

module.exports = { createUnit, listUnitsByProperty, updateUnit, deleteUnit };