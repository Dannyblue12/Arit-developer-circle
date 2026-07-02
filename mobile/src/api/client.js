// Savi API client.
//
// Points at the backend; if the API is unreachable (no server on the demo
// machine, judge's wifi is down, etc.) every call falls back to bundled
// demo data so THE PITCH NEVER DIES. The UI shows a small "demo data"
// badge when fallback is active (see App.js).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEMO } from "./demoData";

// CHANGE THIS to your machine's LAN IP when testing on a phone,
// e.g. "http://192.168.1.50:4000"
export const BASE_URL = "http://10.0.2.2:4000"; // Android-emulator localhost

let token = null;
export let usingDemo = { value: false };

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
