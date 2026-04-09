const Ticket = require("../models/Ticket");
const Tenant = require("../models/Tenant");
const Unit = require("../models/Unit");
const Property = require("../models/Property");
const Lease = require("../models/Lease");
const { analyzeTicketWithAI } = require("../services/aiService");
const emailService = require("../services/emailService");
const { sendWhatsAppMessage } = require("../services/whatsappService");

function ensureCommunicationsArray(ticket) {
  if (!Array.isArray(ticket.communications)) {
    ticket.communications = [];
  }
}

function getSendTicketReplyEmail() {
  if (typeof emailService.sendTicketReplyEmail !== "function") {
    throw new Error(
      "sendTicketReplyEmail no está disponible. Verifica emailService.js y su export."
    );
  }

  return emailService.sendTicketReplyEmail;
}

// =========================
// TENANT
// =========================

// POST /api/tenant/tickets
async function createTenantTicket(req, res) {
  try {
    const { tenantId, unitId, title, description, category, priority } = req.body;

    if (!tenantId || !unitId || !description) {
      return res.status(400).json({
        message: "Faltan campos: tenantId, unitId, description",
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

    let aiResult = {
      title: "Ticket de mantenimiento",
      category: "general",
      priority: "medium",
      suggestion: "",
    };

    try {
      aiResult = await analyzeTicketWithAI(description);
    } catch (err) {
      console.error("AI analyzeTicketWithAI error:", err.message);
    }

    const finalTitle = title?.trim() || aiResult.title;
    const finalCategory = category || aiResult.category;
    const finalPriority = priority || aiResult.priority;
    const finalNotes = aiResult.suggestion || "";

    const ticket = await Ticket.create({
      ownerId: req.user.id,
      tenantId,
      propertyId: property._id,
      unitId,
      leaseId: lease ? lease._id : null,
      title: finalTitle,
      description,
      category: finalCategory,
      priority: finalPriority,
      status: "open",
      source: "dashboard",
      notes: finalNotes,
      communications: [],
    });

    return res.status(201).json({ ticket });
  } catch (err) {
    console.error("createTenantTicket error:", err);
    return res.status(500).json({ message: "Error creando ticket" });
  }
}

// GET /api/tenant/tickets
async function listTenantTickets(req, res) {
  try {
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
  } catch (err) {
    console.error("listTenantTickets error:", err);
    return res.status(500).json({ message: "Error obteniendo tickets del tenant" });
  }
}

// =========================
// LANDLORD
// =========================

// GET /api/tickets
async function listLandlordTickets(req, res) {
  try {
    const tickets = await Ticket.find({ ownerId: req.user.id })
      .populate("tenantId", "fullName email phone")
      .populate("propertyId", "name address")
      .populate("unitId", "unitNumber")
      .populate("leaseId", "monthlyRent status")
      .sort({ createdAt: -1 });

    return res.json({ tickets });
  } catch (err) {
    console.error("listLandlordTickets error:", err);
    return res.status(500).json({ message: "Error obteniendo tickets" });
  }
}

// GET /api/tickets/:id
async function getTicket(req, res) {
  try {
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
  } catch (err) {
    console.error("getTicket error:", err);
    return res.status(500).json({ message: "Error obteniendo ticket" });
  }
}

// PUT /api/tickets/:id
async function updateTicket(req, res) {
  try {
    const allowed = [
      "title",
      "description",
      "category",
      "priority",
      "status",
      "notes",
    ];

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
    )
      .populate("tenantId", "fullName email phone")
      .populate("propertyId", "name address")
      .populate("unitId", "unitNumber")
      .populate("leaseId", "monthlyRent status");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    return res.json({ ticket });
  } catch (err) {
    console.error("updateTicket error:", err);
    return res.status(500).json({ message: "Error actualizando ticket" });
  }
}

// DELETE /api/tickets/:id
async function deleteTicket(req, res) {
  try {
    const ticket = await Ticket.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.id,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    return res.json({ message: "Ticket eliminado" });
  } catch (err) {
    console.error("deleteTicket error:", err);
    return res.status(500).json({ message: "Error eliminando ticket" });
  }
}

// POST /api/tickets/:id/reply-email
async function replyTicketByEmail(req, res) {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: "El mensaje es requerido" });
    }

    const cleanMessage = String(message).trim();

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
    }).populate("tenantId", "fullName email phone");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    if (!ticket.tenantId?.email) {
      return res.status(400).json({
        message: "El tenant no tiene email registrado",
      });
    }

    const sendTicketReplyEmail = getSendTicketReplyEmail();

    await sendTicketReplyEmail(ticket.tenantId.email, ticket, cleanMessage);

    ensureCommunicationsArray(ticket);
    ticket.communications.push({
      channel: "email",
      message: cleanMessage,
      sentAt: new Date(),
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("tenantId", "fullName email phone")
      .populate("propertyId", "name address")
      .populate("unitId", "unitNumber")
      .populate("leaseId", "monthlyRent status");

    return res.json({
      message: "Correo enviado correctamente",
      ticket: updatedTicket,
    });
  } catch (err) {
    console.error("replyTicketByEmail error:", err);
    return res.status(500).json({
      message: err.message || "Error enviando correo del ticket",
    });
  }
}

// POST /api/tickets/:id/notify-whatsapp
async function notifyTicketByWhatsApp(req, res) {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: "El mensaje es requerido" });
    }

    const cleanMessage = String(message).trim();

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
    }).populate("tenantId", "fullName email phone");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    if (!ticket.tenantId?.phone) {
      return res.status(400).json({
        message: "El tenant no tiene teléfono registrado",
      });
    }

    const whatsappBody = [
      "SmartRent CRM",
      `Ticket: ${ticket._id}`,
      `Estado: ${ticket.status}`,
      "",
      cleanMessage,
    ].join("\n");

    await sendWhatsAppMessage(ticket.tenantId.phone, whatsappBody);

    ensureCommunicationsArray(ticket);
    ticket.communications.push({
      channel: "whatsapp",
      message: cleanMessage,
      sentAt: new Date(),
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("tenantId", "fullName email phone")
      .populate("propertyId", "name address")
      .populate("unitId", "unitNumber")
      .populate("leaseId", "monthlyRent status");

    return res.json({
      message: "Notificación de WhatsApp enviada correctamente",
      ticket: updatedTicket,
    });
  } catch (err) {
    console.error("notifyTicketByWhatsApp error:", err);
    return res.status(500).json({
      message: err.message || "Error enviando WhatsApp del ticket",
    });
  }
}

module.exports = {
  createTenantTicket,
  listTenantTickets,
  listLandlordTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  replyTicketByEmail,
  notifyTicketByWhatsApp,
};