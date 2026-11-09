// Upkeep plan rules. These are the same limits the vault contract enforces,
// so the app can explain them before anyone signs anything.

export const MIN_PAYOUT = 10; // Cleva loses stablecoin deposits under $10
export const MAX_WEEKS = 26; // one semester, renewable
export const LOW_WEEKLY_NGN = 7500; // below this, warn the sponsor

const floor2 = (n) => Math.floor(n * 100 + 1e-6) / 100;
const round2 = (n) => Math.round(n * 100) / 100;

// total: dollars the sponsor commits to allowance + emergency pot
// weeks: plan length; emergencyPct: share of total set aside for emergencies
// fees: separate amount reserved for school fees
export function computePlan({ total, weeks, emergencyPct = 15, fees = 0, ngnPerUsd = 1328 }) {
  const errors = [];
  const warnings = [];
  const t = Number(total) || 0;
  const wRaw = Math.round(Number(weeks) || 0);

  if (t <= 0) errors.push("Enter how much you want to send.");
  if (wRaw < 1) errors.push("Choose how many weeks the plan lasts.");
  if (wRaw > MAX_WEEKS)
    errors.push(`Plans last at most ${MAX_WEEKS} weeks (one semester). You can renew next semester.`);

  const w = Math.min(Math.max(1, wRaw), MAX_WEEKS);
  const emergencyPot = round2((t * emergencyPct) / 100);
  const allowance = round2(t - emergencyPot);

  let everyWeeks = 1;
  let payouts = w;
  let perPayout = payouts ? allowance / payouts : 0;

  if (t > 0 && perPayout < MIN_PAYOUT) {
    everyWeeks = 2;
    payouts = Math.ceil(w / 2);
    perPayout = allowance / payouts;
    if (perPayout >= MIN_PAYOUT)
      warnings.push(
        "Weekly paydays would be under $10, which Cleva can't accept, so paydays switch to every 2 weeks."
      );
  }
  if (t > 0 && perPayout < MIN_PAYOUT)
    errors.push(
      "Each payday must be at least $10 (Cleva's minimum). Send more, or choose fewer weeks."
    );

  const weeklyNgn = (perPayout / everyWeeks) * ngnPerUsd;
  if (!errors.length && weeklyNgn < LOW_WEEKLY_NGN)
    warnings.push(
      `That's about ₦${Math.round(weeklyNgn).toLocaleString("en-US")} a week. Student food alone is often ₦7,500–20,000 a week.`
    );

  // When the plan itself is invalid, only show what to fix.
  if (errors.length) warnings.length = 0;

  return {
    total: t,
    weeks: w,
    emergencyPct,
    emergencyPot,
    allowance,
    everyWeeks,
    payouts,
    perPayout: floor2(perPayout),
    fees: Number(fees) || 0,
    vaultTotal: round2(t + (Number(fees) || 0)),
    weeklyNgn,
    errors,
    warnings,
    ok: errors.length === 0,
  };
}

// What the next payday pays: what's left, spread evenly over what's left.
export function nextPayout(plan) {
  if (!plan || plan.payoutsLeft <= 0) return 0;
  if (plan.payoutsLeft === 1) return round2(plan.allowanceLeft);
  return floor2(plan.allowanceLeft / plan.payoutsLeft);
}

// Pulling a payday forward pays one now and spreads the gap over the rest.
// Returns null if it would push future paydays under Cleva's minimum.
export function previewPullForward(plan) {
  if (!plan || plan.payoutsLeft < 2) return null;
  const now = nextPayout(plan);
  const leftAfter = plan.allowanceLeft - now;
  const later = floor2(leftAfter / plan.payoutsLeft);
  if (later < MIN_PAYOUT) return null;
  return { now, later, payoutsAfter: plan.payoutsLeft };
}
