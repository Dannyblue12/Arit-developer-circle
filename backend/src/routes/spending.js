const router = require("express").Router();
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");
const { categoriseOne } = require("../services/categorise");
const { buildSuggestions, benchmarkFor, CATEGORY_META } = require("../services/suggest");

router.use(requireAuth);

function monthWindow() {
  const start = new Date();
  start.setDate(1); start.setHours(0, 0, 0, 0);
  return { occurredAt: { $gte: start } };
}

// GET /api/spending/summary
// Totals + per-category breakdown for the current month, plus how many
// were sorted automatically (the "47 of 50" number, computed honestly).
router.get("/summary", async (req, res) => {
  const txs = await Transaction.find({ user: req.user._id, direction: "debit", ...monthWindow() });
  const byCat = {}; const txCounts = {};
  let sortedAuto = 0;
  for (const t of txs) {
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    txCounts[t.category] = (txCounts[t.category] || 0) + 1;
    if (t.categorySource === "merchant" || t.categorySource === "pattern" || t.categorySource === "user") sortedAuto++;
  }
  const total = txs.reduce((s, t) => s + t.amount, 0);

  const categories = Object.entries(byCat)
    .filter(([c]) => c !== "unknown")
    .map(([c, amount]) => {
      const bench = benchmarkFor(req.user, c);
      return {
        category: c,
        label: CATEGORY_META[c]?.label || c,
        emoji: CATEGORY_META[c]?.emoji || "📦",
        amount,
        txCount: txCounts[c],
        bracketMedian: bench,
        overByPct: bench ? Math.round(((amount - bench) / bench) * 100) : null,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  res.json({
    monthTotal: total,
    projected: Math.round(total * 1.4), // simple pace projection for the demo
    sortedAuto,
    totalTx: txs.length,
    unknownCount: txCounts.unknown || 0,
    categories,
  });
});

// GET /api/spending/suggestions — the optimisation engine's output
router.get("/suggestions", async (req, res) => {
  const txs = await Transaction.find({ user: req.user._id, direction: "debit", ...monthWindow() });
  const byCat = {}; const txCounts = {};
  for (const t of txs) {
    if (t.category === "unknown") continue;
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    txCounts[t.category] = (txCounts[t.category] || 0) + 1;
  }
  const suggestions = buildSuggestions(req.user, byCat, txCounts);
  res.json({ suggestions, startHere: suggestions[0] || null });
});

// GET /api/spending/tidy — unknown transactions awaiting a one-tap tag
router.get("/tidy", async (req, res) => {
  const unknowns = await Transaction.find({
    user: req.user._id, category: "unknown", ...monthWindow(),
  }).sort("-occurredAt").limit(10);
  res.json({ unknowns });
});

// POST /api/spending/tidy/:txId  { category }
// Tags one transaction AND remembers the counterparty forever.
router.post("/tidy/:txId", async (req, res) => {
  const { category } = req.body;
  const tx = await Transaction.findOne({ _id: req.params.txId, user: req.user._id });
  if (!tx) return res.status(404).json({ error: "Transaction not found" });

  tx.category = category;
  tx.categorySource = "user";
  await tx.save();

  req.user.counterpartyTags.set(tx.counterparty, category);
  await req.user.save();

  // retro-apply to that counterparty's other unknowns
  await Transaction.updateMany(
    { user: req.user._id, counterparty: tx.counterparty, category: "unknown" },
    { category, categorySource: "user" }
  );

  res.json({ ok: true, remembered: tx.counterparty, category });
});

// POST /api/spending/transactions — ingest one payment (simulates the
// wallet feed). Categorises it and runs Savi Watch over it.
router.post("/transactions", async (req, res) => {
  const { amount, counterparty, narration, direction } = req.body;
  if (!amount || !counterparty)
    return res.status(400).json({ error: "amount and counterparty are required" });

  const history = await Transaction.find({ user: req.user._id }).sort("-occurredAt").limit(200);
  const { category, categorySource } = categoriseOne(
    { amount, counterparty, narration }, req.user.counterpartyTags, history
  );

  const tx = await Transaction.create({
    user: req.user._id, amount, counterparty,
    narration: narration || "", direction: direction || "debit",
    category, categorySource,
  });

  const { reviewTransaction } = require("../services/watch");
  const alerts = await reviewTransaction(req.user, tx, history);

  res.status(201).json({ transaction: tx, alerts });
});

module.exports = router;
