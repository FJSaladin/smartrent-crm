const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

let client = null;

if (
  accountSid &&
  authToken &&
  fromNumber &&
  accountSid.startsWith("AC")
) {
  client = twilio(accountSid, authToken);
} else {
  console.warn("Twilio no está configurado correctamente. WhatsApp saliente deshabilitado.");
}

async function sendWhatsAppMessage(to, body) {
  if (!client) {
    throw new Error("Twilio no está configurado correctamente");
  }

  return client.messages.create({
    from: fromNumber,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body,
  });
}

module.exports = { sendWhatsAppMessage };