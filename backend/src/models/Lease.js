const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    monthlyRent: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    dueDay: { type: Number, default: 1, min: 1, max: 28 }, // día de pago (1-28)

    status: { type: String, enum: ["active", "ended", "pending"], default: "active" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

// Un unit no debe tener 2 leases activos al mismo tiempo
leaseSchema.index(
  { ownerId: 1, unitId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

module.exports = mongoose.model("Lease", leaseSchema);