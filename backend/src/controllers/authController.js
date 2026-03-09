const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const {
  sendResetPasswordEmail,
  sendVerificationEmail,
} = require("../services/emailService");

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// POST /api/auth/register
async function register(req, res) {
  try {
    let { name, email, password, role, phone } = req.body;

    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");
    role = String(role || "").trim();
    phone = String(phone || "").trim();

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Faltan campos: name, email, password, role",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        message: "El nombre debe tener al menos 2 caracteres",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    if (!["landlord", "tenant"].includes(role)) {
      return res.status(400).json({
        message: "role inválido (usa landlord o tenant)",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        message: "Este email ya está registrado",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role,
      emailVerified: false,
    });

    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(rawVerificationToken)
      .digest("hex");

    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    const verifyLink = `${process.env.APP_URL}/verify-email?token=${rawVerificationToken}`;

    await sendVerificationEmail(user.email, verifyLink);

    const token = signToken(user);

    return res.status(201).json({
      message:
        "Usuario registrado correctamente. Revisa tu correo para confirmar tu cuenta.",
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error(err);

    if (err.name === "ValidationError") {
      const firstError =
        Object.values(err.errors)[0]?.message || "Datos inválidos";
      return res.status(400).json({ message: firstError });
    }

    return res.status(500).json({ message: "Error registrando usuario" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    let { email, password, role } = req.body;

    email = String(email || "").trim().toLowerCase();
    password = String(password || "");
    role = role ? String(role).trim() : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Faltan campos: email, password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tu cuenta está desactivada. Contacta al administrador.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Debes confirmar tu correo antes de iniciar sesión",
      });
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        message: "Rol incorrecto para este usuario",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);

    return res.json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error iniciando sesión" });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error obteniendo usuario" });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    let { email } = req.body;
    email = String(email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "El email es requerido" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message:
          "Si el correo existe, se enviará un enlace para restablecer la contraseña",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.APP_URL}/reset-password?token=${rawToken}`;

    await sendResetPasswordEmail(user.email, resetLink);

    return res.json({
      message:
        "Si el correo existe, se enviará un enlace para restablecer la contraseña",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error procesando solicitud" });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    let { token, password } = req.body;

    token = String(token || "").trim();
    password = String(password || "");

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Faltan campos: token, password" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error restableciendo contraseña" });
  }
}

// POST /api/auth/verify-email
async function verifyEmail(req, res) {
  try {
    let { token } = req.body;
    token = String(token || "").trim();

    if (!token) {
      return res.status(400).json({ message: "Token requerido" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    return res.json({
      message: "Correo confirmado correctamente",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error verificando correo" });
  }
}

// POST /api/auth/resend-verification-email
async function resendVerificationEmail(req, res) {
  try {
    let { email } = req.body;
    email = String(email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "El email es requerido" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Este correo ya fue confirmado" });
    }

    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(rawVerificationToken)
      .digest("hex");

    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    const verifyLink = `${process.env.APP_URL}/verify-email?token=${rawVerificationToken}`;

    await sendVerificationEmail(user.email, verifyLink);

    return res.json({
      message: "Se envió un nuevo correo de verificación",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error reenviando verificación" });
  }
}

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};