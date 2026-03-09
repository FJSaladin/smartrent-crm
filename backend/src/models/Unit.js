const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },

    unitNumber: { type: String, required: true, trim: true }, // ej: "3B"
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },

    status: { type: String, enum: ["vacant", "occupied", "inactive"], default: "vacant" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

unitSchema.index({ propertyId: 1, unitNumber: 1 }, { unique: true });

module.exports = mongoose.model("Unit", unitSchema);