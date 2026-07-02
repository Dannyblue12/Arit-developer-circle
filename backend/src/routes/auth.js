const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

function sign(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "30d",
  });
}

function publicUser(u) {
  return {
    id: u._id, name: u.name, phone: u.phone, area: u.area,
    incomeBand: u.incomeBand, opayLinked: u.opayLinked,
  };
}

// POST /api/auth/register  { name, phone, password, area?, incomeBand? }
router.post("/register", async (req, res) => {
  try {
    const { name, phone, password, area, incomeBand } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ error: "name, phone and password are required" });
    const exists = await User.findOne({ phone });
    if (exists) return res.status(409).json({ error: "Phone already registered" });
    const user = await User.create({ name, phone, password, area, incomeBand });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login  { phone, password }
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone }).select("+password");
    if (!user || !(await user.comparePassword(password || "")))
      return res.status(401).json({ error: "Invalid phone or password" });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/link-opay — demo stub for the OPay OAuth handshake.
// In production this exchanges an OPay authorisation code for read-only
// transaction access. Here it flips the flag and (first time) seeds the
// demo transaction history so the app comes alive immediately.
router.post("/link-opay", requireAuth, async (req, res) => {
  req.user.opayLinked = true;
  await req.user.save();
  const { seedForUser } = require("../seed/seedUserData");
  await seedForUser(req.user);
  res.json({ ok: true, user: publicUser(req.user) });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
