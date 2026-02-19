const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },

    // Tu login muestra Propietario / Inquilino:
    role: { type: String, enum: ["landlord", "tenant"], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
