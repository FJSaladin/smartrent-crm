const twilio = require("twilio");
const Ticket = require("../models/Ticket");
const Tenant = require("../models/Tenant");
const Lease = require("../models/Lease");
const { analyzeTicketWithAI } = require("../services/aiService");

function normalizeWhatsAppPhone(from) {
  return String(from || "")
    .replace(/^whatsapp:/, "")
    .replace(/[^\d+]/g, "")
    .trim();
}

function twimlMessage(body) {
  const response = new twilio.twiml.MessagingResponse();
  response.message(body);
  return response.toString();
}

function looksLikeGreeting(text) {
  const clean = String(text || "").trim().toLowerCase();
  return [
    "hola",
    "hello",
    "hi",
    "buenas",
    "buenos días",
    "buenas tardes",
    "buenas noches",
    "menu",
    "ticket",
    "soporte",
  ].includes(clean);
}

function isTooShortToCreateTicket(text) {
  const clean = String(text || "").trim();
  return clean.length < 12;
}

function looksLikeTicketStatusQuestion(text) {
  const clean = String(text || "").trim().toLowerCase();

  return (
    clean.includes("estado") ||
    clean.includes("status") ||
    clean.includes("ticket") ||
    clean.includes("caso")
  );
}

function extractTicketId(text) {
  const clean = String(text || "").trim();
  const mongoIdMatch = clean.match(/\b[a-f0-9]{24}\b/i);
  if (mongoIdMatch) return mongoIdMatch[0];
  return null;
}

async function findTenantContextByPhone(phone) {
  console.log("Buscando tenant con phone:", phone);

  const tenant = await Tenant.findOne({
    phone,
    status: "active",
  });

  if (!tenant) {
    console.log("Tenant no encontrado");
    return null;
  }

  const lease = await Lease.findOne({
    tenantId: tenant._id,
    status: "active",
  });

  if (!lease) {
    console.log("Lease activo no encontrado");
    return null;
  }

  return { tenant, lease };
}

async function handleIncomingWhatsApp(req, res) {
  try {
    console.log("✅ Entró al controller");
    console.log("BODY:", req.body);

    const from = req.body.From;
    const body = String(req.body.Body || "").trim();
    const phone = normalizeWhatsAppPhone(from);

    console.log("From:", from);
    console.log("Body:", body);
    console.log("Phone normalizado:", phone);

    if (!phone) {
      return res
        .type("text/xml")
        .send(twimlMessage("No se pudo identificar el remitente."));
    }

    const context = await findTenantContextByPhone(phone);

    if (!context) {
      return res.type("text/xml").send(
        twimlMessage(
          "No encontramos un usuario activo asociado a este número. Contacta a administración para registrar tu teléfono."
        )
      );
    }

    const { tenant, lease } = context;

    // =========================
    // CONSULTA DE ESTADO DE TICKET
    // =========================
    if (looksLikeTicketStatusQuestion(body)) {
      const possibleTicketId = extractTicketId(body);

      if (possibleTicketId) {
        const ticket = await Ticket.findOne({
          _id: possibleTicketId,
          tenantId: tenant._id,
        });

        if (!ticket) {
          return res.type("text/xml").send(
            twimlMessage(
              "No encontré un ticket con ese número asociado a tu cuenta."
            )
          );
        }

        return res.type("text/xml").send(
          twimlMessage(
            `Número: ${ticket._id}\nEstado: ${ticket.status}`
          )
        );
      }

      const latestTicket = await Ticket.findOne({
        tenantId: tenant._id,
      }).sort({ createdAt: -1 });

      if (!latestTicket) {
        return res.type("text/xml").send(
          twimlMessage("No tienes tickets registrados en este momento.")
        );
      }

      return res.type("text/xml").send(
        twimlMessage(
          `Número: ${latestTicket._id}\nEstado: ${latestTicket.status}`
        )
      );
    }

    // Si solo saluda o manda algo muy corto, pedir descripción
    if (!body || looksLikeGreeting(body) || isTooShortToCreateTicket(body)) {
      return res.type("text/xml").send(
        twimlMessage(
          "Describe el problema de mantenimiento con el mayor detalle posible y crearé tu ticket automáticamente."
        )
      );
    }

    // IA analiza el párrafo y decide title/category/priority
    let aiResult = {
      title: "Ticket de mantenimiento",
      category: "general",
      priority: "medium",
      suggestion: "",
    };

    try {
      aiResult = await analyzeTicketWithAI(body);
    } catch (err) {
      console.error("AI analyzeTicketWithAI error:", err.message);
    }

    const ticket = await Ticket.create({
      ownerId: tenant.ownerId,
      tenantId: tenant._id,
      propertyId: lease.propertyId,
      unitId: lease.unitId,
      leaseId: lease._id,
      title: aiResult.title || "Ticket de mantenimiento",
      description: body,
      category: aiResult.category || "general",
      priority: aiResult.priority || "medium",
      status: "open",
      source: "whatsapp",
      notes: aiResult.suggestion || "",
    });

    return res.type("text/xml").send(
      twimlMessage(
        `Ticket creado correctamente.\nNúmero: ${ticket._id}\nEstado: ${ticket.status}`
      )
    );
  } catch (err) {
    console.error(err);
    return res.type("text/xml").send(
      twimlMessage("Ocurrió un error procesando tu solicitud. Intenta nuevamente.")
    );
  }
}

module.exports = { handleIncomingWhatsApp };