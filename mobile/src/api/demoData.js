// Bundled demo data — mirrors what the seeded backend returns, so the app
// behaves identically online and offline.

export const DEMO = {
  user: {
    id: "demo",
    name: "Chioma",
    phone: "08010000000",
    area: "Surulere, Lagos",
    incomeBand: "300k_600k",
    opayLinked: true,
  },

  summary: {
    monthTotal: 142800,
    projected: 198000,
    sortedAuto: 47,
    totalTx: 50,
    unknownCount: 3,
    categories: [
      { category: "stock", label: "Shop stock", emoji: "🛒", amount: 58800, txCount: 3, bracketMedian: 60000, overByPct: -2 },
      { category: "food", label: "Food", emoji: "🍲", amount: 45700, txCount: 15, bracketMedian: 32500, overByPct: 40 },
      { category: "transport", label: "Transport", emoji: "🛺", amount: 25300, txCount: 11, bracketMedian: 21000, overByPct: 20 },
      { category: "data", label: "Airtime & data", emoji: "📶", amount: 8000, txCount: 8, bracketMedian: 6000, overByPct: 33 },
      { category: "clothing", label: "Clothing", emoji: "👗", amount: 7200, txCount: 1, bracketMedian: 9000, overByPct: -20 },
      { category: "fitness", label: "Fitness", emoji: "💪", amount: 5000, txCount: 1, bracketMedian: 4000, overByPct: 25 },
    ],
  },

  suggestions: {
    startHere: {
      id: "food_meal_prep",
      category: "food",
      categoryLabel: "Food",
      emoji: "🍲",
      title: "Meal-prep your weekday lunch",
      detail:
        "You're spending about ₦45,700 on food — 40% above people in your bracket. A Sunday meal-prep replaces the ₦1,200 daily plate with ~₦650, same calories.",
      saving: 14000,
      effort: "low",
      evidence: { yourMonthly: 45700, bracketMedian: 32500, overBy: 40 },
    },
    suggestions: [
      {
        id: "food_meal_prep", category: "food", categoryLabel: "Food", emoji: "🍲",
        title: "Meal-prep your weekday lunch",
        detail: "You're spending about ₦45,700 on food — 40% above people in your bracket. A Sunday meal-prep replaces the ₦1,200 daily plate with ~₦650, same calories.",
        saving: 14000, effort: "low",
        evidence: { yourMonthly: 45700, bracketMedian: 32500, overBy: 40 },
      },
      {
        id: "data_monthly_bundle", category: "data", categoryLabel: "Airtime & data", emoji: "📶",
        title: "Move to a monthly bundle",
        detail: "8 small top-ups this month. One monthly plan covers the same usage for less — and ends the top-up dance.",
        saving: 1600, effort: "low",
        evidence: { yourMonthly: 8000, bracketMedian: 6000, overBy: 33 },
      },
      {
        id: "fitness_idle_gym", category: "fitness", categoryLabel: "Fitness", emoji: "💪",
        title: "Pause what you're not using",
        detail: "If the gym's gone unused for weeks, freeze (don't cancel) and switch to a free home routine until you're back.",
        saving: 5000, effort: "low",
        evidence: { yourMonthly: 5000, bracketMedian: 4000, overBy: 25 },
      },
      {
        id: "transport_pool_route", category: "transport", categoryLabel: "Transport", emoji: "🛺",
        title: "Share your repeat route",
        detail: "Transport is pacing 20% above your bracket. Pooling the route you ride most halves that fare.",
        saving: 6300, effort: "medium",
        evidence: { yourMonthly: 25300, bracketMedian: 21000, overBy: 20 },
      },
    ],
  },

  tidy: {
    unknowns: [
      { _id: "t1", counterparty: "Aunty B.", amount: 5000, occurredAt: new Date().toISOString() },
      { _id: "t2", counterparty: "Emeka N.", amount: 3200, occurredAt: new Date().toISOString() },
      { _id: "t3", counterparty: "Blessing A.", amount: 2500, occurredAt: new Date().toISOString() },
    ],
  },

  goals: {
    goals: [
      {
        _id: "g1", title: "Shop restock", emoji: "🛒",
        targetAmount: 60000, savedAmount: 25200, progress: 0.42,
        contributions: [
          { label: "Skipped the pricey lunch", emoji: "🍲", amount: 3500 },
          { label: "Switched to a monthly data plan", emoji: "📶", amount: 2000 },
          { label: "Shared keke on your Yaba route", emoji: "🛺", amount: 1400 },
        ],
      },
      { _id: "g2", title: "New phone", emoji: "📱", targetAmount: 120000, savedAmount: 26400, progress: 0.22, contributions: [] },
    ],
  },

  prices: {
    cheapest: {
      _id: "p1", itemLabel: "Rice — 1 paint (Mama Gold)", emoji: "🍚",
      price: 2650, vendor: "Ojuelegba · Mama Gold", distanceM: 600, confirmations: 4, stale: false,
    },
    finds: [
      { _id: "p1", item: "rice_paint", itemLabel: "Rice — 1 paint (Mama Gold)", emoji: "🍚", price: 2650, vendor: "Ojuelegba · Mama Gold", distanceM: 600, confirmations: 4, stale: false },
      { _id: "p2", item: "rice_paint", itemLabel: "Rice — 1 paint (Mama Gold)", emoji: "🍚", price: 2900, vendor: "Tejuosho stalls", distanceM: 1300, confirmations: 3, stale: false },
      { _id: "p3", item: "rice_paint", itemLabel: "Rice — 1 paint (Mama Gold)", emoji: "🍚", price: 3000, vendor: "Lawanson roadside", distanceM: 800, confirmations: 2, stale: false },
      { _id: "p4", item: "tomato_basket", itemLabel: "Tomato basket (small)", emoji: "🍅", price: 1800, vendor: "Iya Sefi stall", distanceM: 1100, confirmations: 2, stale: false },
      { _id: "p5", item: "data_15gb", itemLabel: "15GB monthly bundle · MTN", emoji: "📶", price: 4500, vendor: "In-app", distanceM: 0, confirmations: 12, stale: false },
    ],
  },

  watch: {
    caughtThisWeek: 3,
    alerts: [
      {
        _id: "w1", severity: "danger", kind: "new_payee_flagged",
        title: "Possible scam — ₦40,000 to a new account",
        body: 'You\'ve never paid "GraceEnt" before, and 3 people flagged this account this month. Take a second look before you send.',
        amount: 40000, counterparty: "GraceEnt",
      },
      {
        _id: "w2", severity: "warn", kind: "silent_debit",
        title: "A subscription you may have forgotten",
        body: "The same ₦1,800 to StreamBox NG has debited 3 months running. Still using it?",
        amount: 1800, counterparty: "StreamBox NG",
      },
      {
        _id: "w3", severity: "info", kind: "overspend_pace",
        title: "4th ₦1,200 lunch this week",
        body: "You're ₦2,000 over your food pace. Not a problem — just so you know before Friday.",
      },
    ],
  },
};
