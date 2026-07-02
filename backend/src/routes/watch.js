const router = require("express").Router();
const WatchAlert = require("../models/WatchAlert");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

// GET /api/watch — open alerts, most severe first
router.get("/", async (req, res) => {
  const order = { danger: 0, warn: 1, info: 2 };
  const alerts = await WatchAlert.find({ user: req.user._id, resolved: false }).sort("-createdAt");
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);
  const caughtThisWeek = await WatchAlert.countDocuments({
    user: req.user._id,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
  });
  res.json({ alerts, caughtThisWeek });
});

// POST /api/watch/:id/resolve  { resolution: "dismissed" | "trusted" | "cancelled" }
router.post("/:id/resolve", async (req, res) => {
  const { resolution } = req.body;
  const alert = await WatchAlert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  alert.resolved = true;
  alert.resolution = resolution || "dismissed";
  await alert.save();
  res.json({ alert });
});

module.exports = router;
