import React, { useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, naira } from "../theme/theme";

// One uniform icon language (Ionicons) across the whole app. The API and
// demo data still tag records with emoji — that contract stays untouched —
// and this map translates each tag to its glyph. Unknown tags get a
// neutral pricetag so nothing ever renders as a raw emoji.
const ICON_MAP = {
  "🍲": "restaurant", "🍚": "restaurant", "🍅": "nutrition",
  "🛺": "car", "🚕": "car",
  "📶": "wifi", "📱": "phone-portrait",
  "💪": "barbell", "📦": "cube", "🛒": "cart",
  "🏠": "home", "👗": "shirt",
  "👤": "person", "🤝": "people", "❓": "help-circle",
  "⭐": "star", "✨": "sparkles",
  "🛡️": "shield-checkmark", "⚠️": "warning", "🔔": "notifications",
  "💡": "bulb", "🔒": "lock-closed", "📍": "location",
  "💳": "card", "🎯": "flag", "🏷️": "pricetag", "📊": "pie-chart",
};
export const iconFor = (tag) => ICON_MAP[tag] || "pricetag";

// Inline icon for use next to text (headings, footers).
export function InlineIcon({ name, emoji, size = 14, color = C.royal, style }) {
  return <Ionicons name={name || iconFor(emoji)} size={size} color={color} style={style} />;
}

// Gentle pulse placeholder shown while a data section loads — never a blank gap.
export function Skeleton({ height = 16, width = "100%", radius = 10, style }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.45, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={[{ height, width, borderRadius: radius, backgroundColor: C.mint, opacity: pulse }, style]}
    />
  );
}

// First-mount entrance: fade in while sliding up 12px. Stagger with `delay`.
export function Entrance({ delay = 0, duration = 300, children, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true }).start();
  }, [anim, delay, duration]);
  return (
    <Animated.View
      style={[
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

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
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {live ? <View style={st.liveDot} /> : null}
        <Text style={st.secText} numberOfLines={1}>{children}</Text>
      </View>
      {right}
    </View>
  );
}

// One consistent icon treatment across every list — an Ionicons glyph in a
// quiet mint chip. Accepts either a direct icon name or a data emoji tag.
export function IconChip({ icon, emoji, size = 40, bg = C.mint, color = C.royal, style }) {
  return (
    <View
      style={[
        {
          width: size, height: size, borderRadius: size * 0.35,
          backgroundColor: bg, alignItems: "center", justifyContent: "center",
        },
        style,
      ]}
    >
      <Ionicons name={icon || iconFor(emoji)} size={size * 0.48} color={color} />
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

// Fills from 0 to its value on mount (500ms ease-out) — progress should feel
// like motion toward a finish line, not a static report.
export function ProgressBar({ value, height = 9, track = C.mint, fill = C.royal }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(1, value || 0),
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width is a layout prop
    }).start();
  }, [value, anim]);
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }}>
      <Animated.View
        style={{
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"], extrapolate: "clamp" }),
          flex: 1,
          backgroundColor: fill,
          borderRadius: height / 2,
        }}
      />
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
  secText: {
    fontSize: 11.5, fontWeight: "700", color: C.muted,
    letterSpacing: 1.1, textTransform: "uppercase",
  },
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
