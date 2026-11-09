// Wellsent demo state. Everything the screens show comes from here, so the
// whole pitch flow works on one phone with no network. The actions mirror
// what the backend + vault contract will do later (create plan, fund,
// payday, asks, emergencies), which keeps the wiring step small.
import React, { createContext, useContext, useMemo, useReducer } from "react";
import { Platform } from "react-native";
import { computePlan, nextPayout, previewPullForward } from "./planMath";

// Demo addresses: correct format, not real wallets.
export const DEMO = {
  clevaAddress: "TQ7mWn3cK8pYhRvB2dLx5sFgJ9aZeU4kTr",
  lookalike: "TQ7mXp1bN6tGqLwC8vRy3hDkS2jMfA4kTr",
  flagged: "TXq9Dm4G7pRVnE1kS8yZc2LwBfHu6aJ3Nt",
  vault: "TVa8sKd2Ry5HbGm9Wq3ZxNc7Pe4Tj6LhUw",
  ethAddress: "0x8f3Ca12B9e4D7a6F5c0E1b2A3d4C5e6F7a8B9c0D",
  inviteCode: "WS-7K2Q",
};

const STUDENT = { name: "Chidi Okon", first: "Chidi", school: "University of Uyo · 300L", phone: "+234 801 000 0000" };
const SPONSOR = { name: "Aunty Ini", first: "Aunty Ini", city: "Houston, USA", phone: "+1 713 555 0142" };
const BACKUP = { name: "Uncle Ekene", city: "Lagos" };
// The third kind of user: someone paying themselves from their own income.
const SELF = { name: "Ada Nwosu", first: "Ada", work: "Freelance product designer", phone: "+234 802 000 0000" };

let seq = 100;
const id = (p) => `${p}${++seq}`;
const fakeTx = () => {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 64; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
};

const DAY = 24 * 3600 * 1000;
export function nextMonday(from = new Date()) {
  const d = new Date(from);
  d.setHours(8, 0, 0, 0);
  const add = (8 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + add);
  return d;
}
export const canUseEmergency = (p) =>
  !!p && p.emergencyLeft >= 10 && (p.emergencyLastUsedAt == null || p.paydaysDone - p.emergencyLastUsedAt >= 4);
export const canPullForward = (p) =>
  !!p && p.status === "active" && p.allowPullForward && p.pullsThisMonth < 2 && !!previewPullForward(p);

export const fmtDay = (d) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function buildPlan(input, status) {
  const p = computePlan(input);
  return {
    ...p,
    status, // awaiting_funding | invited | active | ended
    allowanceLeft: p.allowance,
    payoutsLeft: p.payouts,
    paydaysDone: 0,
    week: 1,
    emergencyLeft: p.emergencyPot,
    emergencyLastUsedAt: null, // paydaysDone when last used; once per 4 paydays
    pullsThisMonth: 0,
    feesStatus: p.fees > 0 ? "reserved" : "none", // reserved | invoice | paid
    feesSchool: "University of Uyo",
    feesDeadline: "15 Dec",
    feesUnused: input.feesUnused || "sponsor",
    allowPullForward: input.allowPullForward !== false,
    backup: input.backup || BACKUP,
    nextPaydayAt: nextMonday().toISOString(),
  };
}

function freshState(role = null) {
  return {
    role,
    onboarded: false,
    student: STUDENT,
    sponsor: SPONSOR,
    self: SELF,
    cleva: null, // { address, network }
    paired: false,
    plan: null,
    asks: [],
    activity: [],
    checkins: [],
    lastPayday: null,
  };
}

// A plan four weeks in: what the judges see first.
export function seededState(role) {
  const plan = buildPlan({ total: 300, weeks: 12, emergencyPct: 15, fees: 100 }, "active");
  const now = Date.now();
  const lastMonday = nextMonday().getTime() - 7 * DAY; // paydays are Mondays, 8am
  const activity = [];
  for (let i = 4; i >= 1; i--) {
    const amt = nextPayout(plan);
    plan.allowanceLeft = Math.round((plan.allowanceLeft - amt) * 100) / 100;
    plan.payoutsLeft -= 1;
    plan.paydaysDone += 1;
    activity.unshift({
      id: id("a"), type: "payday", amount: amt, title: "Payday landed in Cleva",
      at: new Date(lastMonday - (i - 1) * 7 * DAY).toISOString(), tx: fakeTx(),
    });
  }
  plan.week = 5;
  activity.push(
    { id: id("a"), type: "accepted", title: "Chidi accepted the plan", at: new Date(lastMonday - 22 * DAY).toISOString() },
    { id: id("a"), type: "funded", amount: 400, title: "Vault funded", at: new Date(lastMonday - 23 * DAY).toISOString(), tx: fakeTx() }
  );
  activity.push({
    id: id("a"), type: "ask", amount: 12, title: "Ask approved: lab coat",
    at: new Date(now - 10 * DAY).toISOString(), tx: fakeTx(),
  });
  activity.sort((a, b) => new Date(b.at) - new Date(a.at));
  return {
    ...freshState(role),
    role,
    onboarded: true,
    paired: true,
    cleva: { address: DEMO.clevaAddress, network: "TRC20" },
    plan,
    activity,
    lastPayday: { amount: activity.find((a) => a.type === "payday").amount, at: activity.find((a) => a.type === "payday").at },
    asks: [
      { id: id("k"), amount: 15, reason: "Books", note: "GST 211 textbook from the department", photo: true, status: "pending", at: new Date(now - 2 * 3600 * 1000).toISOString() },
      { id: id("k"), amount: 12, reason: "Books", note: "Lab coat for practicals", photo: true, status: "approved", at: new Date(now - 10 * DAY).toISOString() },
    ],
    checkins: [{ id: id("c"), mood: "good", note: "Tests went well 🙏", at: new Date(now - 6 * DAY).toISOString(), shared: true }],
  };
}

// A freelancer three weeks into paying themselves from a $600 client payment.
export function seededSelfState() {
  const plan = buildPlan({ total: 600, weeks: 12, emergencyPct: 10 }, "active");
  plan.backup = null;
  const lastMonday = nextMonday().getTime() - 7 * DAY;
  const activity = [];
  for (let i = 3; i >= 1; i--) {
    const amt = nextPayout(plan);
    plan.allowanceLeft = Math.round((plan.allowanceLeft - amt) * 100) / 100;
    plan.payoutsLeft -= 1;
    plan.paydaysDone += 1;
    activity.unshift({ id: id("a"), type: "payday", amount: amt, title: "Payday landed in Cleva", at: new Date(lastMonday - (i - 1) * 7 * DAY).toISOString(), tx: fakeTx() });
  }
  plan.week = 4;
  activity.push(
    { id: id("a"), type: "accepted", title: "Salary plan started", at: new Date(lastMonday - 15 * DAY).toISOString() },
    { id: id("a"), type: "funded", amount: 600, title: "Client payment locked in vault", at: new Date(lastMonday - 16 * DAY).toISOString(), tx: fakeTx() }
  );
  activity.sort((x, y) => new Date(y.at) - new Date(x.at));
  const last = activity.find((x) => x.type === "payday");
  return {
    ...freshState("self"),
    onboarded: true,
    cleva: { address: DEMO.clevaAddress, network: "TRC20" },
    plan,
    activity,
    lastPayday: { amount: last.amount, at: last.at },
  };
}

function reducer(state, a) {
  switch (a.type) {
    case "reset":
      return a.state;
    case "setRole":
      return { ...state, role: a.role };
    case "signUp":
      return {
        ...state,
        role: a.role,
        [a.role]: {
          ...state[a.role],
          name: a.name || state[a.role].name,
          first: a.first || (a.name ? a.name.split(" ")[0] : state[a.role].first),
          phone: a.phone || state[a.role].phone,
          ...(a.work ? { work: a.work } : {}),
        },
      };
    case "completeSelf":
      return { ...state, onboarded: true, cleva: state.cleva || { address: DEMO.clevaAddress, network: "TRC20" } };
    case "connectCleva":
      return { ...state, cleva: { address: a.address, network: a.network } };
    case "pair":
      return {
        ...state,
        paired: true,
        onboarded: true,
        cleva: state.cleva || { address: DEMO.clevaAddress, network: "TRC20" },
      };
    case "createPlan":
      return { ...state, plan: buildPlan(a.input, "awaiting_funding") };
    case "fundVault": {
      const now = new Date().toISOString();
      const funded = { id: id("a"), type: "funded", amount: state.plan.vaultTotal, title: "Vault funded", at: now, tx: fakeTx() };
      // Paying yourself needs no one's acceptance: the plan starts at once.
      if (state.role === "self") {
        return {
          ...state,
          plan: { ...state.plan, status: "active", nextPaydayAt: nextMonday().toISOString() },
          activity: [{ id: id("a"), type: "accepted", title: "Salary plan started", at: now }, funded, ...state.activity],
        };
      }
      return { ...state, plan: { ...state.plan, status: "invited" }, activity: [funded, ...state.activity] };
    }
    case "topUp": {
      // New income joins the vault and is spread over the paydays left.
      const p = state.plan;
      if (!p || !(a.amount > 0)) return state;
      return {
        ...state,
        plan: {
          ...p,
          allowanceLeft: Math.round((p.allowanceLeft + a.amount) * 100) / 100,
          total: Math.round((p.total + a.amount) * 100) / 100,
          vaultTotal: Math.round((p.vaultTotal + a.amount) * 100) / 100,
        },
        activity: [{ id: id("a"), type: "funded", amount: a.amount, title: `Added to vault: ${a.source || "income"}`, at: new Date().toISOString(), tx: fakeTx() }, ...state.activity],
      };
    }
    case "acceptPlan":
      return {
        ...state,
        plan: { ...state.plan, status: "active", nextPaydayAt: nextMonday().toISOString() },
        activity: [{ id: id("a"), type: "accepted", title: `${state.student.first} accepted the plan`, at: new Date().toISOString() }, ...state.activity],
      };
    case "runPayday": {
      const p = state.plan;
      if (!p || p.status !== "active" || p.payoutsLeft <= 0) return state;
      const amt = nextPayout(p);
      const payoutsLeft = p.payoutsLeft - 1;
      const ended = payoutsLeft === 0;
      const extra = ended ? p.emergencyLeft : 0; // leftovers go to the student
      const at = new Date().toISOString();
      const plan = {
        ...p,
        allowanceLeft: Math.max(0, Math.round((p.allowanceLeft - amt) * 100) / 100),
        payoutsLeft,
        paydaysDone: p.paydaysDone + 1,
        week: Math.min(p.weeks, p.week + p.everyWeeks),
        emergencyLeft: ended ? 0 : p.emergencyLeft,
        status: ended ? "ended" : "active",
        // The demo runs "Monday's payday" now, so the next one is the
        // coming Monday (or the one after, for fortnightly plans).
        nextPaydayAt: new Date(nextMonday().getTime() + 7 * (p.everyWeeks - 1) * DAY).toISOString(),
        pullsThisMonth: (p.paydaysDone + 1) % 4 === 0 ? 0 : p.pullsThisMonth,
      };
      return {
        ...state,
        plan,
        lastPayday: { amount: amt + extra, at },
        activity: [{ id: id("a"), type: "payday", amount: amt + extra, title: ended ? "Final payday (incl. unused emergency money)" : "Payday landed in Cleva", at, tx: fakeTx() }, ...state.activity],
      };
    }
    case "pullForward": {
      const p = state.plan;
      if (!canPullForward(p)) return state;
      const pv = previewPullForward(p);
      const at = new Date().toISOString();
      return {
        ...state,
        plan: { ...p, allowanceLeft: Math.round((p.allowanceLeft - pv.now) * 100) / 100, pullsThisMonth: p.pullsThisMonth + 1 },
        activity: [{ id: id("a"), type: "pull", amount: pv.now, title: "Next payday pulled forward", at, tx: fakeTx() }, ...state.activity],
      };
    }
    case "newAsk":
      return {
        ...state,
        asks: [{ id: id("k"), amount: a.amount, reason: a.reason, note: a.note, photo: a.photo, status: "pending", at: new Date().toISOString() }, ...state.asks],
      };
    case "resolveAsk": {
      const ask = state.asks.find((k) => k.id === a.id);
      if (!ask || ask.status !== "pending") return state;
      const status = a.approve ? "approved" : "declined";
      const asks = state.asks.map((k) => (k.id === a.id ? { ...k, status } : k));
      const activity = a.approve
        ? [{ id: id("a"), type: "ask", amount: ask.amount, title: `Ask approved: ${ask.note || ask.reason}`.slice(0, 48), at: new Date().toISOString(), tx: fakeTx() }, ...state.activity]
        : state.activity;
      return { ...state, asks, activity };
    }
    case "spendEmergency": {
      const p = state.plan;
      if (!p || !canUseEmergency(p) || a.amount > p.emergencyLeft) return state;
      return {
        ...state,
        plan: { ...p, emergencyLeft: Math.round((p.emergencyLeft - a.amount) * 100) / 100, emergencyLastUsedAt: p.paydaysDone },
        activity: [{ id: id("a"), type: "emergency", amount: a.amount, title: `Emergency money used: ${a.reason}`, at: new Date().toISOString(), tx: fakeTx() }, ...state.activity],
      };
    }
    case "fees":
      return {
        ...state,
        plan: { ...state.plan, feesStatus: a.status, feesRef: a.ref || state.plan.feesRef },
        activity:
          a.status === "paid"
            ? [{ id: id("a"), type: "fees", amount: state.plan.fees, title: `School fees paid to ${state.plan.feesSchool}`, at: new Date().toISOString(), tx: fakeTx() }, ...state.activity]
            : state.activity,
      };
    case "checkIn":
      return {
        ...state,
        checkins: [{ id: id("c"), mood: a.mood, note: a.note, shared: a.shared, at: new Date().toISOString() }, ...state.checkins],
      };
    default:
      return state;
  }
}

// On web, ?demo=student|sponsor|new and &screen=Name let us open any
// screen directly (used for screenshots and the pitch laptop).
export function bootFromUrl() {
  if (Platform.OS !== "web" || typeof window === "undefined") return { state: freshState(), screen: undefined };
  const q = new URLSearchParams(window.location.search);
  const demo = q.get("demo");
  const screen = q.get("screen") || undefined;
  if (demo === "self") {
    const s = seededSelfState();
    if (q.get("plan") === "none") s.plan = null;
    return { state: s, screen };
  }
  if (demo === "student" || demo === "sponsor") {
    const s = seededState(demo);
    if (q.get("plan") === "invited") s.plan = { ...s.plan, status: "invited" };
    if (q.get("plan") === "none") s.plan = null;
    if (q.get("asks") === "none") s.asks = s.asks.filter((k) => k.status !== "pending");
    return { state: s, screen };
  }
  return { state: freshState(), screen };
}

const Ctx = createContext(null);

export function StoreProvider({ initial, children }) {
  const [state, dispatch] = useReducer(reducer, initial || freshState());
  const actions = useMemo(
    () => ({
      reset: (role) => dispatch({ type: "reset", state: role === "self" ? seededSelfState() : role ? seededState(role) : freshState() }),
      completeSelf: () => dispatch({ type: "completeSelf" }),
      topUp: (p) => dispatch({ type: "topUp", ...p }),
      setRole: (role) => dispatch({ type: "setRole", role }),
      signUp: (p) => dispatch({ type: "signUp", ...p }),
      connectCleva: (p) => dispatch({ type: "connectCleva", ...p }),
      pair: () => dispatch({ type: "pair" }),
      createPlan: (input) => dispatch({ type: "createPlan", input }),
      fundVault: () => dispatch({ type: "fundVault" }),
      acceptPlan: () => dispatch({ type: "acceptPlan" }),
      runPayday: () => dispatch({ type: "runPayday" }),
      pullForward: () => dispatch({ type: "pullForward" }),
      newAsk: (p) => dispatch({ type: "newAsk", ...p }),
      resolveAsk: (askId, approve) => dispatch({ type: "resolveAsk", id: askId, approve }),
      spendEmergency: (p) => dispatch({ type: "spendEmergency", ...p }),
      setFees: (status, ref) => dispatch({ type: "fees", status, ref }),
      checkIn: (p) => dispatch({ type: "checkIn", ...p }),
    }),
    []
  );
  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
