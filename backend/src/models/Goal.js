const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    emoji: { type: String, default: "🎯" },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    targetDate: { type: Date },
    contributions: [
      {
        label: String, // "Skipped the pricey lunch"
        emoji: String,
        amount: Number,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

goalSchema.virtual("progress").get(function () {
  return this.targetAmount ? Math.min(1, this.savedAmount / this.targetAmount) : 0;
});
goalSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Goal", goalSchema);
