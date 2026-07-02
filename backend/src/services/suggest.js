// Savi's optimisation engine: measure spending against benchmarks for the
// user's income band + area, then produce specific, evidence-backed
// suggestions per category.
//
// Benchmarks below are illustrative seed values for the prototype. In
// production they are computed nightly from anonymised, aggregated user
// data per (incomeBand, area) cohort — that aggregation is the moat.
//
// If LLM_API_KEY is set, phrasing can be delegated to an LLM; the numbers
// ALWAYS come from this engine so suggestions stay grounded, never invented.

const BENCHMARKS = {
  // monthly ₦ medians per income band (illustrative)
  "300k_600k": {
    food: 32500, transport: 21000, data: 6000, stock: 60000,
    fitness: 4000, clothing: 9000, rent: 45000,
  },
  "100k_300k": {
    food: 21000, transport: 14000, data: 4500, stock: 30000,
    fitness: 2500, clothing: 6000, rent: 30000,
  },
  under_100k: {
    food: 14000, transport: 9000, data: 3000, stock: 12000,
    fitness: 1500, clothing: 3500, rent: 18000,
  },
  over_600k: {
    food: 48000, transport: 32000, data: 9000, stock: 120000,
    fitness: 8000, clothing: 18000, rent: 90000,
  },
};

const CATEGORY_META = {
  food:      { label: "Food",           emoji: "🍲" },
  transport: { label: "Transport",      emoji: "🛺" },
  data:      { label: "Airtime & data", emoji: "📶" },
  stock:     { label: "Shop stock",     emoji: "🛒" },
  fitness:   { label: "Fitness",        emoji: "💪" },
  clothing:  { label: "Clothing",       emoji: "👗" },
  rent:      { label: "Rent",           emoji: "🏠" },
  personal:  { label: "Personal",       emoji: "👤" },
  loan:      { label: "Loans",          emoji: "🤝" },
  other:     { label: "Other",          emoji: "📦" },
  unknown:   { label: "Needs a tag",    emoji: "❓" },
};

// Playbook of concrete, local optimisations per category. The engine picks
// plays whose conditions match the user's actual numbers, so every tip
// arrives with its evidence attached.
const PLAYBOOK = {
  food: [
    {
      id: "meal_prep",
      when: (m) => m.overBy >= 0.25,
      make: (m) => ({
        title: "Meal-prep your weekday lunch",
        detail: `You're spending about ₦${fmt(m.monthly)} on food — ${pct(m.overBy)} above people in your bracket. A Sunday meal-prep replaces the ₦1,200 daily plate with ~₦650, same calories.`,
        saving: Math.round(m.monthly * 0.3),
        effort: "low",
      }),
    },
    {
      id: "cheaper_vendor",
      when: () => true,
      make: (m) => ({
        title: "Switch one regular vendor",
        detail: "Community prices show the same meals cheaper within walking distance. Check Prices → Food before your usual spot.",
        saving: Math.round(m.monthly * 0.12),
        effort: "low",
      }),
    },
  ],
  transport: [
    {
      id: "pool_route",
      when: (m) => m.overBy >= 0.15,
      make: (m) => ({
        title: "Share your repeat route",
        detail: `Transport is pacing ${pct(m.overBy)} above your bracket. Pooling the route you ride most halves that fare.`,
        saving: Math.round(m.monthly * 0.25),
        effort: "medium",
      }),
    },
    {
      id: "batch_runs",
      when: () => true,
      make: (m) => ({
        title: "Batch your market runs",
        detail: "Two planned supplier trips a week instead of five ad-hoc ones cuts fares without cutting stock.",
        saving: Math.round(m.monthly * 0.1),
        effort: "low",
      }),
    },
  ],
  data: [
    {
      id: "monthly_bundle",
      when: (m) => m.txCount >= 6,
      make: (m) => ({
        title: "Move to a monthly bundle",
        detail: `${m.txCount} small top-ups this month. One monthly plan covers the same usage for less — and ends the top-up dance.`,
        saving: Math.round(m.monthly * 0.2),
        effort: "low",
      }),
    },
  ],
  fitness: [
    {
      id: "idle_gym",
      when: (m) => m.monthly > 0,
      make: (m) => ({
        title: "Pause what you're not using",
        detail: "If the gym's gone unused for weeks, freeze (don't cancel) and switch to a free home routine until you're back.",
        saving: m.monthly,
        effort: "low",
      }),
    },
  ],
  stock: [
    {
      id: "dead_stock",
      when: (m) => m.overBy >= 0.1,
      make: (m) => ({
        title: "Trim slow stock",
        detail: "Ordering slightly less, more often, matches your real sales pace and frees cash sitting on the shelf.",
        saving: Math.round(m.monthly * 0.03),
        effort: "medium",
      }),
    },
  ],
  clothing: [
    {
      id: "cloth_pace",
      when: (m) => m.overBy >= 0.3,
      make: (m) => ({
        title: "Set a clothing pace",
        detail: `Clothing is running ${pct(m.overBy)} over your bracket this month. A simple monthly cap keeps style without the leak.`,
        saving: Math.round(m.monthly * 0.25),
        effort: "low",
      }),
    },
  ],
};

function fmt(n) { return Number(n || 0).toLocaleString("en-NG"); }
function pct(x) { return `${Math.round(x * 100)}%`; }

// monthlyByCategory: { food: 45700, ... }, txCounts: { data: 8, ... }
function buildSuggestions(user, monthlyByCategory, txCounts) {
  const bench = BENCHMARKS[user.incomeBand] || BENCHMARKS["300k_600k"];
  const out = [];

  for (const [cat, monthly] of Object.entries(monthlyByCategory)) {
    if (!PLAYBOOK[cat] || !monthly) continue;
    const benchVal = bench[cat] || monthly;
    const overBy = benchVal ? (monthly - benchVal) / benchVal : 0;
    const metrics = { monthly, benchVal, overBy, txCount: txCounts[cat] || 0 };

    for (const play of PLAYBOOK[cat]) {
      if (play.when(metrics)) {
        const s = play.make(metrics);
        out.push({
          id: `${cat}_${play.id}`,
          category: cat,
          categoryLabel: CATEGORY_META[cat].label,
          emoji: CATEGORY_META[cat].emoji,
          ...s,
          evidence: {
            yourMonthly: monthly,
            bracketMedian: benchVal,
            overBy: Math.round(overBy * 100),
          },
        });
      }
    }
  }

  // Rank: biggest saving for least effort first — the "Start here" logic.
  const effortRank = { low: 0, medium: 1, high: 2 };
  out.sort((a, b) => effortRank[a.effort] - effortRank[b.effort] || b.saving - a.saving);
  return out;
}

function benchmarkFor(user, category) {
  const bench = BENCHMARKS[user.incomeBand] || BENCHMARKS["300k_600k"];
  return bench[category] || null;
}

module.exports = { buildSuggestions, benchmarkFor, CATEGORY_META, BENCHMARKS };
