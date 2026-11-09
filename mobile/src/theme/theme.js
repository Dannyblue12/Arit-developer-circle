// Wellsent design tokens — "Night & Gold".
// Indigo is the brand. Gold is reserved for money landing. Green / orange /
// red are reserved for Shield verdicts, so they never appear as decoration.
export const C = {
  indigo: "#3538CD",
  indigoDeep: "#2628A3",
  indigoTint: "#EEF0FF",
  indigoLine: "#D9DCFB",
  ink: "#10153A",
  muted: "#5B6178",
  faint: "#9AA0B4",
  line: "#E7E8EF",
  paper: "#FAF9F6",
  card: "#FFFFFF",
  gold: "#F5B800",
  goldSoft: "#FFF4CC",
  goldInk: "#5C4500",
  safe: "#12B76A",
  safeSoft: "#E7F7EE",
  safeInk: "#0B6B3E",
  caution: "#EA580C",
  cautionSoft: "#FDEEE3",
  cautionInk: "#8A3207",
  danger: "#D92D20",
  dangerSoft: "#FDE9E7",
  dangerInk: "#8F1D14",
};

// Plus Jakarta Sans, loaded in App.js. Use fontFamily (not fontWeight) so
// Android renders the right cut.
export const F = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semi: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  heavy: "PlusJakartaSans_800ExtraBold",
};

// Demo exchange rate — update on pitch day.
export const NGN_PER_USD = 1328;

const group = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// $21.25, $300 (no trailing .00)
export function usd(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const [i, d] = v.toFixed(2).split(".");
  return `$${group(i)}${d === "00" ? "" : "." + d}`;
}

export function naira(n) {
  return `₦${group(String(Math.round(Number(n) || 0)))}`;
}

export const toNaira = (dollars) => (Number(dollars) || 0) * NGN_PER_USD;

export const shortAddr = (a = "") => (a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-6)}` : a);

export const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
