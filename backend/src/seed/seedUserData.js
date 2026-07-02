// Seeds a believable month of Nigerian wallet activity for a user the
// moment they "link OPay" — so the demo comes alive instantly. Amounts
// mirror the pitch narrative (Chioma's month).

const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const PriceFind = require("../models/PriceFind");
const WatchAlert = require("../models/WatchAlert");
const { categoriseOne } = require("../services/categorise");

function daysAgo(n, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return d;
}

const DEMO_TXS = [
  // food — the ₦1,200 lunch habit
  ...[1, 2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16].map((d) => ({
    amount: 1200, counterparty: "CV Foods Kitchen", narration: "lunch", occurredAt: daysAgo(d, 13),
  })),
  { amount: 8500, counterparty: "Ojuelegba Market Foods", narration: "foodstuff", occurredAt: daysAgo(6, 9) },
  { amount: 9600, counterparty: "Mama Ngozi Kitchen", narration: "", occurredAt: daysAgo(12, 13) },
  { amount: 13200, counterparty: "Shoprite Surulere", narration: "groceries", occurredAt: daysAgo(18, 17) },

  // transport
  ...[1, 3, 5, 8, 10, 13, 15].map((d) => ({
    amount: 1400, counterparty: "Bolt", narration: "ride", occurredAt: daysAgo(d, 8),
  })),
  ...[2, 6, 9, 14].map((d) => ({
    amount: 3900, counterparty: "LagRide", narration: "market run", occurredAt: daysAgo(d, 10),
  })),

  // data — small frequent top-ups (triggers the bundle suggestion)
  ...[1, 3, 5, 7, 9, 11, 13, 15].map((d) => ({
    amount: 1000, counterparty: "MTN", narration: "airtime", occurredAt: daysAgo(d, 19),
  })),

  // fitness — idle gym
  { amount: 5000, counterparty: "iFitness Surulere", narration: "monthly", occurredAt: daysAgo(20, 7) },

  // stock (supplier is a plain-name transfer — becomes "unknown" until tagged... 
  // except we pre-tag two below to demo the memory)
  { amount: 21000, counterparty: "David O.", narration: "", occurredAt: daysAgo(4, 11) },
  { amount: 18500, counterparty: "David O.", narration: "", occurredAt: daysAgo(11, 11) },
  { amount: 19300, counterparty: "David O.", narration: "", occurredAt: daysAgo(19, 11) },

  // clothing
  { amount: 7200, counterparty: "Bimpe Boutique", narration: "", occurredAt: daysAgo(9, 16) },

  // the tidy-up unknowns — plain transfers with no readable context
  { amount: 5000, counterparty: "Aunty B.", narration: "", occurredAt: daysAgo(3, 15) },
  { amount: 3200, counterparty: "Emeka N.", narration: "", occurredAt: daysAgo(5, 12) },
  { amount: 2500, counterparty: "Blessing A.", narration: "", occurredAt: daysAgo(8, 18) },

  // silent recurring debit (triggers Watch)
  { amount: 1800, counterparty: "StreamBox NG", narration: "sub", occurredAt: daysAgo(2, 6) },
  { amount: 1800, counterparty: "StreamBox NG", narration: "sub", occurredAt: daysAgo(32, 6) },
  { amount: 1800, counterparty: "StreamBox NG", narration: "sub", occurredAt: daysAgo(62, 6) },

  // income
  ...[2, 5, 9, 12, 16].map((d) => ({
    amount: 38000 + d * 700, counterparty: "POS Sales", narration: "daily sales",
    occurredAt: daysAgo(d, 18), direction: "credit",
  })),
];

const DEMO_PRICES = [
  { item: "rice_paint", itemLabel: "Rice — 1 paint (Mama Gold)", emoji: "🍚", price: 2650, vendor: "Ojuelegba · Mama Gold", distanceM: 600, confirmations: 4, reportedAt: daysAgo(0, 7) },
  { item: "rice_paint", itemLabel: "Rice — 1 paint (Mama Gold)", emoji: "🍚", price: 2900, vendor: "Tejuosho stalls", distanceM: 1300, confirmations: 3, reportedAt: daysAgo(0, 9) },
  { item: "rice_paint", itemLabel: "Rice — 1 paint (Mama Gold)", emoji: "🍚", price: 3000, vendor: "Lawanson roadside", distanceM: 800, confirmations: 2, reportedAt: daysAgo(1, 15) },
  { item: "tomato_basket", itemLabel: "Tomato basket (small)", emoji: "🍅", price: 1800, vendor: "Iya Sefi stall", distanceM: 1100, confirmations: 2, reportedAt: daysAgo(0, 6) },
  { item: "data_15gb", itemLabel: "15GB monthly bundle · MTN", emoji: "📶", price: 4500, vendor: "In-app", distanceM: 0, confirmations: 12, reportedAt: daysAgo(0, 8) },
];

async function seedForUser(user) {
  const existing = await Transaction.countDocuments({ user: user._id });
  if (existing > 0) return; // already seeded

  // pre-tag the supplier so the memory feature is visible immediately
  user.counterpartyTags = { ...user.counterpartyTags, "David O.": "stock" };
  user.markModified("counterpartyTags");
  await user.save();

  const history = [];
  for (const raw of DEMO_TXS) {
    const { category, categorySource } = categoriseOne(raw, user.counterpartyTags, history);
    const doc = { ...raw, user: user._id, direction: raw.direction || "debit", category, categorySource };
    history.push(doc);
    await Transaction.create(doc);
  }

  await PriceFind.insertMany(DEMO_PRICES.map((p) => ({ ...p, user: user._id, area: user.area })));

  await Goal.create({
    user: user._id, title: "Shop restock", emoji: "🛒",
    targetAmount: 60000, savedAmount: 25200,
    targetDate: daysAgo(-16),
    contributions: [
      { label: "Skipped the pricey lunch", emoji: "🍲", amount: 3500 },
      { label: "Switched to a monthly data plan", emoji: "📶", amount: 2000 },
      { label: "Shared keke on your Yaba route", emoji: "🛺", amount: 1400 },
    ],
  });
  await Goal.create({
    user: user._id, title: "New phone", emoji: "📱",
    targetAmount: 120000, savedAmount: 26400,
  });

  await WatchAlert.insertMany([
    {
      user: user._id, severity: "danger", kind: "new_payee_flagged",
      title: "Possible scam — ₦40,000 to a new account",
      body: 'You\'ve never paid "GraceEnt" before, and 3 people flagged this account this month. Take a second look before you send.',
      amount: 40000, counterparty: "GraceEnt",
    },
    {
      user: user._id, severity: "warn", kind: "silent_debit",
      title: "A subscription you may have forgotten",
      body: "The same ₦1,800 to StreamBox NG has debited 3 months running. Still using it?",
      amount: 1800, counterparty: "StreamBox NG",
    },
    {
      user: user._id, severity: "info", kind: "overspend_pace",
      title: "4th ₦1,200 lunch this week",
      body: "You're ₦2,000 over your food pace. Not a problem — just so you know before Friday.",
    },
  ]);
}

module.exports = { seedForUser };
