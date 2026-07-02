const router = require("express").Router();
const Goal = require("../models/Goal");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

// GET /api/goals
router.get("/", async (req, res) => {
  // Oldest first: the user's first goal is their primary goal (the hero
  // card on Home/Goals), matching the bundled demo data's ordering.
  const goals = await Goal.find({ user: req.user._id }).sort("createdAt");
  res.json({ goals });
});

// POST /api/goals  { title, emoji?, targetAmount, targetDate? }
router.post("/", async (req, res) => {
  const { title, emoji, targetAmount, targetDate } = req.body;
  if (!title || !targetAmount)
    return res.status(400).json({ error: "title and targetAmount are required" });
  const goal = await Goal.create({
    user: req.user._id, title, emoji, targetAmount, targetDate,
  });
  res.status(201).json({ goal });
});

// POST /api/goals/:id/contribute  { label, emoji?, amount }
// A saving Savi found gets attached to the goal — the finish-line moment.
router.post("/:id/contribute", async (req, res) => {
  const { label, emoji, amount } = req.body;
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  goal.contributions.push({ label, emoji, amount });
  goal.savedAmount += Number(amount) || 0;
  await goal.save();
  res.json({ goal });
});

module.exports = router;
