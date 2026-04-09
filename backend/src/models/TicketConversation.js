const mongoose = require("mongoose");

const ticketConversationSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      default: null,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    step: {
      type: String,
      enum: [
        "awaiting_category",
        "awaiting_description",
        "awaiting_priority",
        "awaiting_confirmation",
        "completed",
      ],
      default: "awaiting_category",
    },

    draftTicket: {
      category: { type: String, default: "general" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      priority: { type: String, default: "medium" },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketConversation", ticketConversationSchema);