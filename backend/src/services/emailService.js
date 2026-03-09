const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetPasswordEmail(to, resetLink) {
  await transporter.sendMail({
    from: `"SmartRent CRM" <${process.env.SMTP_USER}>`,
    to,
    subject: "Recuperación de contraseña - SmartRent CRM",
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este enlace expirará en 15 minutos.</p>
    `,
  });
}

async function sendVerificationEmail(to, verifyLink) {
  await transporter.sendMail({
    from: `"SmartRent CRM" <${process.env.SMTP_USER}>`,
    to,
    subject: "Confirma tu correo - SmartRent CRM",
    html: `
      <h2>Confirma tu correo electrónico</h2>
      <p>Gracias por registrarte en SmartRent CRM.</p>
      <p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
      <a href="${verifyLink}">${verifyLink}</a>
      <p>Este enlace expirará en 24 horas.</p>
    `,
  });
}

module.exports = {
  sendResetPasswordEmail,
  sendVerificationEmail,
};