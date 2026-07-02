const mongoose = require("mongoose");

// A community-reported price: "Rice, 1 paint, ₦2,650, Mama Gold, Ojuelegba".
// Confirmations by other users nearby build trust; stale finds are
// down-ranked by recency in the ranking endpoint.
const priceFindSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: String, required: true, index: true }, // "rice_paint"
    itemLabel: { type: String, required: true }, // "Rice — 1 paint (Mama Gold)"
    emoji: { type: String, default: "🛒" },
    price: { type: Number, required: true },
    vendor: { type: String, required: true }, // "Ojuelegba · Mama Gold"
    area: { type: String, required: true, index: true }, // "Surulere, Lagos"
    distanceM: { type: Number, default: 0 }, // demo stand-in for geo lookup
    confirmations: { type: Number, default: 0 },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceFind", priceFindSchema);
