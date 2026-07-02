// Savi Watch: rule-based guardian over outgoing payments.
//
// Design promise (repeated in the UI): Savi only WARNS — it never moves or
// blocks money. Each rule below produces an alert; the app shows it and the
// user decides.
//
// The flagged-accounts list is seeded for the demo; in production it grows
// from community reports + partner (OPay) fraud signals.

const WatchAlert = require("../models/WatchAlert");

const FLAGGED_ACCOUNTS = [
  { name: "GraceEnt", reports: 3 },
  { name: "QuickPay Deals", reports: 5 },
];

const LARGE_PAYMENT = 25000;

async function reviewTransaction(user, tx, history) {
  const alerts = [];

  // Rule 1 — new payee that others flagged
  const flagged = FLAGGED_ACCOUNTS.find(
    (f) => f.name.toLowerCase() === tx.counterparty.toLowerCase()
  );
  const seenBefore = history.some((h) => h.counterparty === tx.counterparty);
  if (flagged && !seenBefore) {
    alerts.push({
      severity: "danger",
      kind: "new_payee_flagged",
      title: `Possible scam — ₦${tx.amount.toLocaleString()} to a new account`,
      body: `You've never paid "${tx.counterparty}" before, and ${flagged.reports} people flagged this account this month. Take a second look before you send.`,
      amount: tx.amount,
      counterparty: tx.counterparty,
    });
  }

  // Rule 2 — large payment to any first-time payee
  if (!flagged && !seenBefore && tx.amount >= LARGE_PAYMENT) {
    alerts.push({
      severity: "warn",
      kind: "new_payee_flagged",
      title: `First payment to ${tx.counterparty}`,
      body: `₦${tx.amount.toLocaleString()} to an account you've never used. Confirm the details before sending.`,
      amount: tx.amount,
      counterparty: tx.counterparty,
    });
  }

  // Rule 3 — silent recurring debit (same amount+payee, 3+ months)
  const sameMonthly = history.filter(
    (h) => h.counterparty === tx.counterparty && h.amount === tx.amount
  );
  if (sameMonthly.length >= 2) {
    alerts.push({
      severity: "warn",
      kind: "silent_debit",
      title: "A subscription you may have forgotten",
      body: `The same ₦${tx.amount.toLocaleString()} to ${tx.counterparty} has debited ${sameMonthly.length + 1} times. Still using it?`,
      amount: tx.amount,
      counterparty: tx.counterparty,
    });
  }

  // Rule 4 — duplicate charge inside 10 minutes
  const dup = history.find(
    (h) =>
      h.counterparty === tx.counterparty &&
      h.amount === tx.amount &&
      Math.abs(new Date(h.occurredAt) - new Date(tx.occurredAt)) < 10 * 60 * 1000
  );
  if (dup) {
    alerts.push({
      severity: "danger",
      kind: "duplicate_charge",
      title: "Possible duplicate charge",
      body: `Two identical payments of ₦${tx.amount.toLocaleString()} to ${tx.counterparty} within minutes. Check before it costs you twice.`,
      amount: tx.amount,
      counterparty: tx.counterparty,
    });
  }

  const saved = await WatchAlert.insertMany(
    alerts.map((a) => ({ ...a, user: user._id }))
  );
  return saved;
}

// Weekly pace check, e.g. "4th ₦1,200 lunch this week" — informational.
async function paceCheck(user, weeklyCategorySpend, weeklyBenchmarks) {
  const alerts = [];
  for (const [cat, spent] of Object.entries(weeklyCategorySpend)) {
    const bench = weeklyBenchmarks[cat];
    if (bench && spent > bench * 1.2) {
      alerts.push({
        user: user._id,
        severity: "info",
        kind: "overspend_pace",
        title: `${cat[0].toUpperCase() + cat.slice(1)} is pacing high`,
        body: `You're ₦${Math.round(spent - bench).toLocaleString()} over your usual ${cat} pace this week. Not a problem — just so you know before Friday.`,
      });
    }
  }
  if (alerts.length) return WatchAlert.insertMany(alerts);
  return [];
}

module.exports = { reviewTransaction, paceCheck, FLAGGED_ACCOUNTS };
