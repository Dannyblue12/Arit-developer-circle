// Savi's categorisation engine.
//
// Order of precedence (this IS the product story):
//   1. user tag        — the user told us once who this counterparty is
//   2. merchant match  — known merchant names sort most transactions
//   3. pattern         — repeated amount+counterparty rhythm (rent, supplier)
//   4. unknown         — surfaced in "Tidy up" for a one-tap answer
//
// No ML weights are required for a credible v1: merchant matching alone
// covers the large majority of wallet transactions. The LLM layer (optional,
// see suggest.js) refines narrations it can read.

const MERCHANT_MAP = [
  { match: /mtn|airtel|glo|9mobile|spectranet/i, category: "data" },
  { match: /bolt|uber|indriver|lagride|keke|okada/i, category: "transport" },
  { match: /shoprite|market|foods?|kitchen|restaurant|eatery|chicken|suya|mama\s/i, category: "food" },
  { match: /gym|fit|ifitness/i, category: "fitness" },
  { match: /supplier|wholesale|distribut/i, category: "stock" },
  { match: /landlord|rent/i, category: "rent" },
  { match: /boutique|tailor|fabric|okrika/i, category: "clothing" },
];

function categoriseOne(tx, userTags = new Map(), history = []) {
  // 1. user memory
  const tagged = userTags.get ? userTags.get(tx.counterparty) : userTags[tx.counterparty];
  if (tagged) return { category: tagged, categorySource: "user" };

  // 2. merchant match on counterparty or narration
  const hay = `${tx.counterparty} ${tx.narration || ""}`;
  for (const rule of MERCHANT_MAP) {
    if (rule.match.test(hay)) return { category: rule.category, categorySource: "merchant" };
  }

  // 3. pattern: same counterparty seen >=3 times with a dominant category
  const priors = history.filter(
    (h) => h.counterparty === tx.counterparty && h.category !== "unknown"
  );
  if (priors.length >= 3) {
    const counts = {};
    priors.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (n / priors.length >= 0.7) return { category: top, categorySource: "pattern" };
  }

  // 4. genuinely unknown — goes to Tidy Up
  return { category: "unknown", categorySource: "unknown" };
}

module.exports = { categoriseOne, MERCHANT_MAP };
