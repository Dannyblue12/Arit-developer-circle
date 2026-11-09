// Wellsent UI kit. One look everywhere: indigo actions, gold only when money
// lands, green/orange/red only inside Shield verdicts.
import React, { useEffect, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, Animated, Easing, ScrollView, TextInput, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "../theme/theme";

const WEIGHT = { regular: F.regular, medium: F.medium, semi: F.semi, bold: F.bold, heavy: F.heavy };

export function T({ w = "regular", size = 14, color = C.ink, style, children, ...rest }) {
  return (
    <Text style={[{ fontFamily: WEIGHT[w], fontSize: size, color }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Screen({ children, scroll = true, bg = C.paper, pad = 20, footer }) {
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, 12) + 8;
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ padding: pad, paddingTop: top, paddingBottom: footer ? 24 : 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: pad, paddingTop: top }}>{children}</View>
      )}
      {footer ? (
        <View style={{ paddingHorizontal: pad, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: bg }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export function TopBar({ title, onBack, right, sub }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={st.topRow}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={st.back} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={20} color={C.ink} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }} />
        {right}
      </View>
      {title ? <T w="heavy" size={26} style={{ marginTop: 14, letterSpacing: -0.4 }}>{title}</T> : null}
      {sub ? <T size={14} color={C.muted} style={{ marginTop: 6, lineHeight: 21 }}>{sub}</T> : null}
    </View>
  );
}

export const pressFx = ({ pressed }) => (pressed ? { transform: [{ scale: 0.985 }], opacity: 0.92 } : null);

const CARD_TONES = {
  default: { backgroundColor: C.card, borderColor: C.line },
  indigo: { backgroundColor: C.indigo, borderColor: C.indigo },
  tint: { backgroundColor: C.indigoTint, borderColor: C.indigoLine },
  gold: { backgroundColor: C.goldSoft, borderColor: "#F2DE8F" },
  safe: { backgroundColor: C.safeSoft, borderColor: "#BFE8D0" },
  caution: { backgroundColor: C.cautionSoft, borderColor: "#F6CDB0" },
  danger: { backgroundColor: C.dangerSoft, borderColor: "#F5C2BD" },
  ink: { backgroundColor: C.ink, borderColor: C.ink },
};

export function Card({ children, style, onPress, tone = "default" }) {
  const body = <View style={[st.card, CARD_TONES[tone], style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress} style={pressFx}>{body}</Pressable> : body;
}

const BTN = {
  primary: { bg: C.indigo, fg: "#fff", border: C.indigo },
  ghost: { bg: "#fff", fg: C.indigo, border: C.line },
  dark: { bg: C.ink, fg: "#fff", border: C.ink },
  gold: { bg: C.gold, fg: C.ink, border: C.gold },
  danger: { bg: C.danger, fg: "#fff", border: C.danger },
  light: { bg: "rgba(255,255,255,0.12)", fg: "#fff", border: "rgba(255,255,255,0.25)" },
};

export function Button({ label, onPress, variant = "primary", icon, disabled, style, small }) {
  const v = BTN[variant];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        st.btn,
        small && st.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        disabled && { opacity: 0.4 },
        style,
        pressed && !disabled && { transform: [{ scale: 0.985 }], opacity: 0.92 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={v.fg} style={{ marginRight: 8 }} /> : null}
      <T w="bold" size={small ? 13.5 : 15} color={v.fg}>{label}</T>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [st.chip, selected && st.chipOn, pressed && { opacity: 0.85 }]}
      accessibilityState={{ selected: !!selected }}
    >
      {icon ? <Ionicons name={icon} size={15} color={selected ? "#fff" : C.indigo} style={{ marginRight: 6 }} /> : null}
      <T w="semi" size={13} color={selected ? "#fff" : C.ink}>{label}</T>
    </Pressable>
  );
}

const PILL = {
  indigo: [C.indigoTint, C.indigo],
  gold: [C.goldSoft, C.goldInk],
  safe: [C.safeSoft, C.safeInk],
  caution: [C.cautionSoft, C.cautionInk],
  danger: [C.dangerSoft, C.dangerInk],
  muted: ["#F0F1F5", C.muted],
  onDark: ["rgba(255,255,255,0.14)", "#fff"],
};

export function Pill({ text, tone = "indigo", icon, style }) {
  const [bg, fg] = PILL[tone];
  return (
    <View style={[st.pill, { backgroundColor: bg }, style]}>
      {icon ? <Ionicons name={icon} size={12} color={fg} style={{ marginRight: 4 }} /> : null}
      <T w="bold" size={11.5} color={fg}>{text}</T>
    </View>
  );
}

const CHIP_TONES = {
  indigo: [C.indigoTint, C.indigo],
  gold: [C.goldSoft, "#B98700"],
  safe: [C.safeSoft, C.safe],
  caution: [C.cautionSoft, C.caution],
  danger: [C.dangerSoft, C.danger],
  ink: [C.ink, "#fff"],
  onDark: ["rgba(255,255,255,0.14)", "#fff"],
};

export function IconChip({ icon, tone = "indigo", size = 40, style }) {
  const [bg, fg] = CHIP_TONES[tone];
  return (
    <View style={[{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: bg, alignItems: "center", justifyContent: "center" }, style]}>
      <Ionicons name={icon} size={size * 0.5} color={fg} />
    </View>
  );
}

export function SectionLabel({ children, right }) {
  return (
    <View style={st.secRow}>
      <T w="bold" size={11.5} color={C.muted} style={{ letterSpacing: 1.1, textTransform: "uppercase", flex: 1 }}>
        {children}
      </T>
      {right}
    </View>
  );
}

export function ListItem({ icon, tone = "indigo", title, subtitle, right, onPress, last }) {
  const body = (
    <View style={[st.li, !last && st.liLine]}>
      {icon ? <IconChip icon={icon} tone={tone} size={38} style={{ marginRight: 12 }} /> : null}
      <View style={{ flex: 1 }}>
        <T w="semi" size={14.5}>{title}</T>
        {subtitle ? <T size={12.5} color={C.muted} style={{ marginTop: 2 }}>{subtitle}</T> : null}
      </View>
      {right}
      {onPress && !right ? <Ionicons name="chevron-forward" size={18} color={C.faint} /> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={pressFx}>{body}</Pressable> : body;
}

export function Field({ label, prefix, hint, style, inputStyle, ...input }) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {label ? <T w="semi" size={13} color={C.muted} style={{ marginBottom: 6 }}>{label}</T> : null}
      <View style={st.field}>
        {prefix ? <T w="bold" size={16} color={C.muted} style={{ marginRight: 6 }}>{prefix}</T> : null}
        <TextInput
          placeholderTextColor={C.faint}
          style={[{ flex: 1, fontFamily: F.semi, fontSize: 16, color: C.ink, paddingVertical: 12 }, inputStyle]}
          {...input}
        />
      </View>
      {hint ? <T size={12} color={C.muted} style={{ marginTop: 6 }}>{hint}</T> : null}
    </View>
  );
}

export function Toggle({ label, sub, value, onValueChange }) {
  return (
    <View style={st.toggle}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <T w="semi" size={14.5}>{label}</T>
        {sub ? <T size={12.5} color={C.muted} style={{ marginTop: 2 }}>{sub}</T> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D5D7E0", true: C.indigo }}
        thumbColor="#fff"
        activeThumbColor="#fff"
      />
    </View>
  );
}

export function Notice({ icon = "information-circle", tone = "tint", children, style }) {
  const fg = { tint: C.indigo, gold: "#B98700", safe: C.safe, caution: C.caution, danger: C.danger }[tone] || C.indigo;
  return (
    <Card tone={tone} style={[{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 12 }, style]}>
      <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 10, marginTop: 1 }} />
      <T size={13} color={C.ink} style={{ flex: 1, lineHeight: 19 }}>{children}</T>
    </Card>
  );
}

// Fills from 0 to its value on mount: progress should feel like motion.
export function ProgressBar({ value, height = 8, track = C.indigoTint, fill = C.indigo }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(1, value || 0), duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [value, anim]);
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }}>
      <Animated.View
        style={{
          height, borderRadius: height / 2, backgroundColor: fill,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
        }}
      />
    </View>
  );
}

// Fade + 12px rise on first mount. Stagger with `delay`.
export function Entrance({ delay = 0, children, style }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 320, delay, useNativeDriver: true }).start();
  }, [a, delay]);
  return (
    <Animated.View style={[{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function Stepper({ value, onChange, min = 1, max = 26, suffix }) {
  return (
    <View style={st.stepper}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={st.stepBtn} hitSlop={8} accessibilityLabel="Fewer">
        <Ionicons name="remove" size={20} color={C.indigo} />
      </Pressable>
      <T w="heavy" size={22} style={{ minWidth: 90, textAlign: "center" }}>
        {value} <T w="semi" size={14} color={C.muted}>{suffix}</T>
      </T>
      <Pressable onPress={() => onChange(Math.min(max + 5, value + 1))} style={st.stepBtn} hitSlop={8} accessibilityLabel="More">
        <Ionicons name="add" size={20} color={C.indigo} />
      </Pressable>
    </View>
  );
}

const SHIELD = {
  safe: { tone: "safe", icon: "shield-checkmark", color: C.safe, ink: C.safeInk, head: "Looks safe" },
  caution: { tone: "caution", icon: "alert-circle", color: C.caution, ink: C.cautionInk, head: "Check before you send" },
  danger: { tone: "danger", icon: "warning", color: C.danger, ink: C.dangerInk, head: "Wait! No send am yet" },
};

// The Shield verdict card. Danger pulses its border once to catch the eye.
export function ShieldResult({ result, style }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (result?.level !== "danger") return;
    pulse.setValue(0);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(pulse, { toValue: 0, duration: 500, useNativeDriver: false }),
    ]).start();
  }, [result?.level, result?.reasons?.length, pulse]);
  if (!result || result.level === "idle") return null;
  const s = SHIELD[result.level];
  const borderColor = pulse.interpolate({ inputRange: [0, 1], outputRange: [CARD_TONES[s.tone].borderColor, s.color] });
  return (
    <Animated.View style={[st.card, CARD_TONES[s.tone], { borderWidth: 1.5, borderColor }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Ionicons name={s.icon} size={20} color={s.color} style={{ marginRight: 8 }} />
        <T w="heavy" size={15} color={s.ink}>{s.head}</T>
        <View style={{ flex: 1 }} />
        <Pill text="SHIELD" tone={s.tone} icon="shield" />
      </View>
      {result.reasons.map((r, i) => (
        <View key={i} style={{ flexDirection: "row", marginTop: 6 }}>
          <View style={[st.dot, { backgroundColor: SHIELD[r.level].color }]} />
          <View style={{ flex: 1 }}>
            <T w="bold" size={13.5} color={s.ink}>{r.title}</T>
            <T size={12.5} color={C.ink} style={{ marginTop: 1, lineHeight: 18, opacity: 0.85 }}>{r.detail}</T>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

export const st = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", minHeight: 36 },
  back: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: C.line,
    alignItems: "center", justifyContent: "center",
  },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16, borderWidth: 1, marginTop: 8,
  },
  btnSmall: { paddingVertical: 10, borderRadius: 12, marginTop: 0 },
  chip: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: "#fff", marginRight: 8, marginBottom: 8,
  },
  chipOn: { backgroundColor: C.indigo, borderColor: C.indigo },
  pill: { flexDirection: "row", alignItems: "center", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, alignSelf: "flex-start" },
  secRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 10 },
  li: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  liLine: { borderBottomWidth: 1, borderBottomColor: C.line },
  field: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line,
    borderRadius: 14, paddingHorizontal: 14,
  },
  toggle: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  stepper: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff",
    borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 8,
  },
  stepBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.indigoTint, alignItems: "center", justifyContent: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 6, marginRight: 9 },
  row: { flexDirection: "row", alignItems: "center" },
});
