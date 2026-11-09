import { test } from "node:test";
import assert from "node:assert/strict";
import { computePlan, nextPayout, previewPullForward } from "./planMath.js";

test("$300 over 12 weeks with 15% emergency → $21.25 weekly + $45 pot", () => {
  const p = computePlan({ total: 300, weeks: 12, emergencyPct: 15, fees: 100 });
  assert.equal(p.ok, true);
  assert.equal(p.emergencyPot, 45);
  assert.equal(p.perPayout, 21.25);
  assert.equal(p.everyWeeks, 1);
  assert.equal(p.vaultTotal, 400);
});

test("plans longer than 26 weeks are blocked", () => {
  const p = computePlan({ total: 1000, weeks: 104 });
  assert.equal(p.ok, false);
  assert.match(p.errors[0], /26 weeks/);
});

test("$1,000 over 26 weeks → $32.69 weekly + $150 pot", () => {
  const p = computePlan({ total: 1000, weeks: 26 });
  assert.equal(p.perPayout, 32.69);
  assert.equal(p.emergencyPot, 150);
});

test("small plans switch to fortnightly to stay above Cleva's $10 minimum", () => {
  const p = computePlan({ total: 100, weeks: 12 });
  assert.equal(p.ok, true);
  assert.equal(p.everyWeeks, 2);
  assert.ok(p.perPayout >= 10);
  assert.ok(p.warnings.length > 0);
});

test("plans too small even fortnightly are rejected", () => {
  const p = computePlan({ total: 50, weeks: 12 });
  assert.equal(p.ok, false);
});

test("last payday pays the exact remainder", () => {
  assert.equal(nextPayout({ allowanceLeft: 21.29, payoutsLeft: 1 }), 21.29);
});

test("pull forward pays one now and shrinks the rest, never under $10", () => {
  const pv = previewPullForward({ allowanceLeft: 170, payoutsLeft: 8 });
  assert.equal(pv.now, 21.25);
  assert.equal(pv.later, 18.59);
  assert.equal(previewPullForward({ allowanceLeft: 22, payoutsLeft: 2 }), null);
});

test("an over-long plan shows only the length error", () => {
  const p = computePlan({ total: 300, weeks: 28 });
  assert.equal(p.ok, false);
  assert.equal(p.warnings.length, 0);
});
