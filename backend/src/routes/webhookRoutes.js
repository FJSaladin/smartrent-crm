const express = require("express");
const { handleIncomingWhatsApp } = require("../controllers/whatsappWebhookController");

const router = express.Router();

router.post("/whatsapp", handleIncomingWhatsApp);

module.exports = router;