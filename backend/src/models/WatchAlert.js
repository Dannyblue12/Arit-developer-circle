const mongoose = require("mongoose");

const watchAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    severity: { type: String, enum: ["danger", "warn", "info"], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    amount: { type: Number },
    counterparty: { type: String },
    kind: {
      type: String,
      enum: ["new_payee_flagged", "silent_debit", "overspend_pace", "duplicate_charge"],
      required: true,
    },
    resolved: { type: Boolean, default: false },
    resolution: { type: String, enum: ["dismissed", "trusted", "cancelled", null], default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchAlert", watchAlertSchema);
