const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    // Landlord propietario del tenant
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Usuario autenticado vinculado
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      unique: true,
      sparse: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [120, "El nombre es demasiado largo"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    notes: {
      type: String,
      default: "",
      maxlength: [500, "Las notas no pueden exceder 500 caracteres"],
    },
  },
  { timestamps: true }
);

// Evita duplicados de email por landlord
tenantSchema.index(
  { ownerId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

module.exports = mongoose.model("Tenant", tenantSchema);