const Property = require("../models/Property");

// POST /api/properties
async function createProperty(req, res) {
  const { name, address, status, notes } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: "Faltan campos: name, address" });
  }

  const property = await Property.create({
    ownerId: req.user.id,
    name,
    address,
    status: status || "active",
    notes: notes || ""
  });

  return res.status(201).json({ property });
}

// GET /api/properties
async function listProperties(req, res) {
  const properties = await Property.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ properties });
}

// GET /api/properties/:id
async function getProperty(req, res) {
  const property = await Property.findOne({ _id: req.params.id, ownerId: req.user.id });
  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });
  return res.json({ property });
}

// PUT /api/properties/:id
async function updateProperty(req, res) {
  const updates = {};
  const allowed = ["name", "address", "status", "notes"];
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  const property = await Property.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    { $set: updates },
    { new: true }
  );

  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });
  return res.json({ property });
}

// DELETE /api/properties/:id
async function deleteProperty(req, res) {
  const property = await Property.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!property) return res.status(404).json({ message: "Propiedad no encontrada" });
  return res.json({ message: "Propiedad eliminada" });
}

module.exports = {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
};