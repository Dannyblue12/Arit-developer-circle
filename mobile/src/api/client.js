// Savi API client.
//
// Points at the backend; if the API is unreachable (no server on the demo
// machine, judge's wifi is down, etc.) every call falls back to bundled
// demo data so THE PITCH NEVER DIES. The UI shows a small "demo data"
// badge when fallback is active (see App.js).

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { DEMO } from "./demoData";

// The API host is derived from wherever Metro is serving the app: when you
// scan the QR with Expo Go, `hostUri` is your dev machine's LAN IP, and the
// backend runs on that same machine on :4000 — so the phone finds the API
// with no manual IP editing. Override with EXPO_PUBLIC_API_URL if the API
// lives elsewhere. Falls back to the Android-emulator loopback.
function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:4000` : "http://10.0.2.2:4000";
}
export const BASE_URL = resolveBaseUrl();

// Demo credentials — the seeded pitch account. In the challenge build there
// is one identity; real sign-in ships with the OPay OAuth integration.
const DEMO_ACCOUNT = { name: "Chioma", phone: "08010000000", password: "savi1234" };

let token = null;

// Tiny observable so App.js can react when fallback mode flips.
function observable(initial) {
  const subs = new Set();
  return {
    get value() { return this._v; },
    set value(v) {
      if (this._v === v) return;
      this._v = v;
      subs.forEach((f) => f(v));
    },
    _v: initial,
    subscribe(f) { subs.add(f); return () => subs.delete(f); },
  };
}

export const usingDemo = observable(false);

export async function loadToken() {
  token = await AsyncStorage.getItem("savi_token");
  return token;
}

async function setToken(t) {
  token = t;
  if (t) await AsyncStorage.setItem("savi_token", t);
  else await AsyncStorage.removeItem("savi_token");
}

async function req(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Wrap a live call with a demo fallback.
async function withFallback(liveCall, demoValue) {
  try {
    const out = await liveCall();
    usingDemo.value = false;
    return out;
  } catch (e) {
    usingDemo.value = true;
    return typeof demoValue === "function" ? demoValue() : demoValue;
  }
}

// ---------- auth ----------
export async function register(payload) {
  return withFallback(
    async () => {
      const data = await req("/auth/register", { method: "POST", body: payload });
      await setToken(data.token);
      return data;
    },
    () => ({ user: DEMO.user, token: "demo" })
  );
}

export async function login(phone, password) {
  return withFallback(
    async () => {
      const data = await req("/auth/login", { method: "POST", body: { phone, password } });
      await setToken(data.token);
      return data;
    },
    () => ({ user: DEMO.user, token: "demo" })
  );
}

export async function linkOpay() {
  return withFallback(() => req("/auth/link-opay", { method: "POST" }), { ok: true });
}

export async function logout() { await setToken(null); }

export const getMe = () => withFallback(() => req("/auth/me"), { user: DEMO.user });

// The signed-in user, for greetings etc. Starts as the demo identity so the
// UI never shows a blank name; replaced by the live profile once a session
// exists.
export const currentUser = observable(DEMO.user);

// Establish a session with the API so live data flows: reuse a stored token
// if it still works, otherwise sign in to the seeded demo account, and if
// this backend has never seen the demo account, create it. Any failure just
// leaves us in offline demo mode — the pitch never dies.
export async function ensureSession() {
  try {
    await loadToken();
    if (token) {
      try {
        const { user } = await req("/auth/me");
        usingDemo.value = false;
        currentUser.value = user;
        return user;
      } catch {
        await setToken(null); // stale/expired token — fall through to login
      }
    }
    let data;
    try {
      data = await req("/auth/login", {
        method: "POST",
        body: { phone: DEMO_ACCOUNT.phone, password: DEMO_ACCOUNT.password },
      });
    } catch (e) {
      // Unseeded backend: register the demo identity (link-opay seeds it).
      data = await req("/auth/register", { method: "POST", body: DEMO_ACCOUNT });
    }
    await setToken(data.token);
    usingDemo.value = false;
    currentUser.value = data.user;
    return data.user;
  } catch {
    usingDemo.value = true;
    return DEMO.user;
  }
}

// ---------- spending ----------
export const getSummary = () =>
  withFallback(() => req("/spending/summary"), DEMO.summary);

export const getSuggestions = () =>
  withFallback(() => req("/spending/suggestions"), DEMO.suggestions);

export const getTidy = () =>
  withFallback(() => req("/spending/tidy"), DEMO.tidy);

export const tagTransaction = (txId, category) =>
  withFallback(
    () => req(`/spending/tidy/${txId}`, { method: "POST", body: { category } }),
    { ok: true, category }
  );

// ---------- goals ----------
export const getGoals = () => withFallback(() => req("/goals"), DEMO.goals);

// ---------- prices ----------
export const getFreshPrices = () =>
  withFallback(() => req("/prices/fresh"), { finds: DEMO.prices.finds.slice(0, 3) });

export const getPrices = (item) =>
  withFallback(
    () => req(`/prices${item ? `?item=${item}` : ""}`),
    DEMO.prices
  );

export const shareFind = (payload) =>
  withFallback(
    () => req("/prices", { method: "POST", body: payload }),
    { find: payload, reward: { pending: 50, currency: "NGN" } }
  );

// ---------- watch ----------
export const getWatch = () => withFallback(() => req("/watch"), DEMO.watch);

export const resolveAlert = (id, resolution) =>
  withFallback(
    () => req(`/watch/${id}/resolve`, { method: "POST", body: { resolution } }),
    { ok: true }
  );
