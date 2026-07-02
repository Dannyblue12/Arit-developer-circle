const mongoose = require("mongoose");

// A transaction as it would arrive from a wallet feed (e.g. OPay).
// `category` is what Savi's engine assigns; `categorySource` records HOW
// it was assigned (merchant match, pattern, user tag, or unknown) — this
// is what powers the "47 of 50 sorted automatically" story honestly.
const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    direction: { type: String, enum: ["debit", "credit"], default: "debit" },
    amount: { type: Number, required: true },
    counterparty: { type: String, required: true }, // e.g. "MTN", "Bolt", "David O."
    narration: { type: String, default: "" },
    occurredAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ["food", "transport", "data", "stock", "personal", "loan", "rent", "fitness", "clothing", "other", "unknown"],
      default: "unknown",
      index: true,
    },
    categorySource: {
      type: String,
      enum: ["merchant", "pattern", "user", "unknown"],
      default: "unknown",
    },
    flagged: { type: Boolean, default: false }, // set by Savi Watch
    flagReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
