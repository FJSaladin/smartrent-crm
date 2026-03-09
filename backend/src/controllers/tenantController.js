const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Lease = require("../models/Lease");

// POST /api/tenants
async function createTenant(req, res) {
  const { fullName, email, phone, status, notes } = req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Falta campo: fullName" });
  }

  try {
    const tenant = await Tenant.create({
      ownerId: req.user.id,
      fullName,
      email: (email || "").toLowerCase(),
      phone: phone || "",
      status: status || "active",
      notes: notes || "",
    });

    return res.status(201).json({ tenant });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Ya existe un tenant con ese email" });
    }
    console.error(err);
    return res.status(500).json({ message: "Error creando tenant" });
  }
}

// GET /api/tenants
async function listTenants(req, res) {
  const tenants = await Tenant.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ tenants });
}

// GET /api/tenants/:id
async function getTenant(req, res) {
  const tenant = await Tenant.findOne({ _id: req.params.id, ownerId: req.user.id });
  if (!tenant) return res.status(404).json({ message: "Tenant no encontrado" });
  return res.json({ tenant });
}

// PUT /api/tenants/:id
async function updateTenant(req, res) {
  const updates = {};
  const allowed = ["fullName", "email", "phone", "status", "notes"];

  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      updates[k] = k === "email" ? String(req.body[k]).toLowerCase() : req.body[k];
    }
  }

  try {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!tenant) return res.status(404).json({ message: "Tenant no encontrado" });
    return res.json({ tenant });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Ya existe un tenant con ese email" });
    }
    console.error(err);
    return res.status(500).json({ message: "Error actualizando tenant" });
  }
}

// DELETE /api/tenants/:id
async function deleteTenant(req, res) {
  const tenant = await Tenant.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!tenant) return res.status(404).json({ message: "Tenant no encontrado" });
  return res.json({ message: "Tenant eliminado" });
}

// PATCH /api/tenants/:id/link-user
async function linkTenantToUser(req, res) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Falta campo: userId" });
  }

  try {
    const tenant = await Tenant.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant no encontrado" });
    }

    const user = await User.findOne({
      _id: userId,
      role: "tenant",
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario tenant no encontrado" });
    }

    const alreadyLinked = await Tenant.findOne({ userId });

    if (alreadyLinked && String(alreadyLinked._id) !== String(tenant._id)) {
      return res.status(409).json({
        message: "Este usuario ya está vinculado a otro tenant",
      });
    }

    tenant.userId = user._id;

    // sincronización básica opcional
    if (!tenant.email) tenant.email = user.email;
    if (!tenant.phone) tenant.phone = user.phone || "";

    await tenant.save();

    return res.json({
      message: "Tenant vinculado al usuario correctamente",
      tenant,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error vinculando tenant con usuario" });
  }
}

// GET /api/tenant/me
async function getMyTenantProfile(req, res) {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });

    if (!tenant) {
      return res.status(404).json({ message: "Perfil de tenant no encontrado" });
    }

    const activeLease = await Lease.findOne({
      tenantId: tenant._id,
      status: "active",
    })
      .populate("propertyId", "name address")
      .populate("unitId", "unitNumber status rent");

    return res.json({
      tenant,
      activeLease,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error obteniendo perfil del tenant" });
  }
}

module.exports = {
  createTenant,
  listTenants,
  getTenant,
  updateTenant,
  deleteTenant,
  linkTenantToUser,
  getMyTenantProfile,
};