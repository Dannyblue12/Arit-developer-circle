import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSend, detectNetwork, isLookalike } from "./shield.js";

const CLEVA = "TQ7mWn3cK8pYhRvB2dLx5sFgJ9aZeU4kTr";
const LOOKALIKE = "TQ7mXp1bN6tGqLwC8vRy3hDkS2jMfA4kTr";
const FLAGGED = "TXq9Dm4G7pRVnE1kS8yZc2LwBfHu6aJ3Nt";
const ETH = "0x8f3Ca12B9e4D7a6F5c0E1b2A3d4C5e6F7a8B9c0D";
const contacts = [{ label: "My Cleva account", address: CLEVA, network: "TRC20" }];

test("detects networks from address format", () => {
  assert.equal(detectNetwork(CLEVA), "TRC20");
  assert.equal(detectNetwork(ETH), "ERC20");
  assert.equal(detectNetwork("hello"), null);
});

test("empty address is idle", () => {
  assert.equal(checkSend({ address: "" }).level, "idle");
});

test("saved Cleva address with a valid amount is safe", () => {
  const r = checkSend({ address: CLEVA, network: "TRC20", amount: 25, contacts, destination: "cleva" });
  assert.equal(r.level, "safe");
});

test("lookalike of a saved address is danger", () => {
  assert.ok(isLookalike(CLEVA, LOOKALIKE));
  const r = checkSend({ address: LOOKALIKE, network: "TRC20", amount: 50, contacts });
  assert.equal(r.level, "danger");
  assert.match(r.reasons[0].title, /Lookalike/);
});

test("wrong network is danger", () => {
  const r = checkSend({ address: ETH, network: "TRC20", amount: 50, contacts });
  assert.equal(r.level, "danger");
  assert.ok(r.reasons.some((x) => x.title === "Wrong network"));
});

test("under $10 to Cleva is danger", () => {
  const r = checkSend({ address: CLEVA, network: "TRC20", amount: 8, contacts, destination: "cleva" });
  assert.equal(r.level, "danger");
  assert.ok(r.reasons.some((x) => /\$10/.test(x.title)));
});

test("reported address is danger", () => {
  const r = checkSend({ address: FLAGGED, network: "TRC20", amount: 30, contacts });
  assert.equal(r.level, "danger");
});

test("large first payment to a new valid address is caution", () => {
  const r = checkSend({ address: "TVa8sKd2Ry5HbGm9Wq3ZxNc7Pe4Tj6LhUw", network: "TRC20", amount: 150, contacts });
  assert.equal(r.level, "caution");
});
