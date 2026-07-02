const router = require("express").Router();
const PriceFind = require("../models/PriceFind");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

// GET /api/prices?item=rice_paint — ranked list for the user's area.
// Rank = price ascending, with stale finds (>3 days) pushed down.
router.get("/", async (req, res) => {
  const { item } = req.query;
  const q = { area: req.user.area };
  if (item) q.item = item;
  const finds = await PriceFind.find(q).sort("price").limit(30);

  const now = Date.now();
  const ranked = finds
    .map((f) => ({
      ...f.toObject(),
      stale: now - new Date(f.reportedAt).getTime() > 3 * 24 * 3600 * 1000,
    }))
    .sort((a, b) => a.stale - b.stale || a.price - b.price);

  res.json({ finds: ranked, cheapest: ranked[0] || null });
});

// GET /api/prices/fresh — home-screen feed of recent nearby finds
router.get("/fresh", async (req, res) => {
  const finds = await PriceFind.find({ area: req.user.area })
    .sort("-reportedAt").limit(6);
  res.json({ finds });
});

// POST /api/prices  { item, itemLabel, emoji?, price, vendor, distanceM? }
// Share a find. Earning (₦50 on confirmation) is recorded product-side;
// wallet payout is the OPay-integration phase.
router.post("/", async (req, res) => {
  const { item, itemLabel, emoji, price, vendor, distanceM } = req.body;
  if (!item || !itemLabel || !price || !vendor)
    return res.status(400).json({ error: "item, itemLabel, price and vendor are required" });
  const find = await PriceFind.create({
    user: req.user._id, item, itemLabel, emoji, price, vendor,
    area: req.user.area, distanceM: distanceM || 0,
  });
  res.status(201).json({ find, reward: { pending: 50, currency: "NGN" } });
});

// POST /api/prices/:id/confirm — a neighbour confirms the price
router.post("/:id/confirm", async (req, res) => {
  const find = await PriceFind.findById(req.params.id);
  if (!find) return res.status(404).json({ error: "Find not found" });
  find.confirmations += 1;
  await find.save();
  res.json({ find });
});

module.exports = router;
