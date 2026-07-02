import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { C, naira } from "../theme/theme";

// Shared press feedback: everything tappable settles to 0.98 scale.
export const pressScale = ({ pressed }) =>
  pressed ? { transform: [{ scale: 0.98 }], opacity: 0.92 } : null;

export function Card({ children, style, onPress }) {
  const body = <View style={[st.card, style]}>{children}</View>;
  return onPress ? (
    <Pressable onPress={onPress} style={pressScale}>{body}</Pressable>
  ) : body;
}

export function SectionLabel({ children, right, live }) {
  return (
    <View style={st.secRow}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {live ? <View style={st.liveDot} /> : null}
        <Text style={st.secText}>{children}</Text>
      </View>
      {right}
    </View>
  );
}

export function Cta({ label, onPress, ghost, danger, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        st.cta,
        ghost && st.ctaGhost,
        danger && { backgroundColor: C.live },
        style,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
      ]}
    >
      <Text style={[st.ctaText, ghost && { color: C.royal }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, height = 9, track = C.mint, fill = C.royal }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }}>
      <View style={{ width: `${Math.min(100, Math.round(value * 100))}%`, flex: 1, backgroundColor: fill, borderRadius: height / 2 }} />
    </View>
  );
}

export function Amount({ value, size = 24, color = C.ink }) {
  return <Text style={{ fontSize: size, fontWeight: "800", color }}>{naira(value)}</Text>;
}

export function Pill({ text, color = C.royal, bg = C.mint }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}>
      <Text style={{ color, fontSize: 11, fontWeight: "700" }}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    backgroundColor: C.card, borderRadius: 18, borderWidth: 1,
    borderColor: C.line, padding: 16, marginBottom: 12,
  },
  secRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 18, marginBottom: 10,
  },
  secText: { fontSize: 13.5, fontWeight: "700", color: C.ink },
  liveDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.live,
    marginRight: 8,
  },
  cta: {
    backgroundColor: C.royal, borderRadius: 15, paddingVertical: 15,
    alignItems: "center", marginTop: 8,
  },
  ctaGhost: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: C.line,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14.5 },
});
