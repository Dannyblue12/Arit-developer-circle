const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    area: { type: String, default: "Surulere, Lagos" },
    incomeBand: {
      type: String,
      enum: ["under_100k", "100k_300k", "300k_600k", "over_600k"],
      default: "300k_600k",
    },
    opayLinked: { type: Boolean, default: false },
    // counterparty memory: once the user tags "David O." as supplier,
    // future transfers to David auto-categorise. This is the "ask once,
    // remember forever" behaviour from the product spec.
    counterpartyTags: {
      type: Map,
      of: String, // counterpartyName -> category slug
      default: {},
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
