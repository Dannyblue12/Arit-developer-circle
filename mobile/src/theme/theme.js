// Savi design tokens — white + royal green identity from the product spec.
export const C = {
  paper: "#FBFBF7",
  card: "#FFFFFF",
  ink: "#0E2419",
  muted: "#5F7269",
  faint: "#94A39B",
  line: "#E8ECE7",
  royal: "#15583C",
  royal2: "#1A7049",
  royalDeep: "#0C3A26",
  mint: "#E7F2EB",
  mint2: "#D6EADD",
  gold: "#B9822A",
  goldSoft: "#F4E9D2",
  live: "#DD5C39",
  liveSoft: "#FBE7DF",
};

export const S = {
  screen: { flex: 1, backgroundColor: C.paper },
  pad: { paddingHorizontal: 20 },
  h1: { fontSize: 26, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4 },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
  },
  row: { flexDirection: "row", alignItems: "center" },
  mono: { fontVariant: ["tabular-nums"], fontWeight: "700" },
};

export const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
