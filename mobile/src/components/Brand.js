// Brand surfaces and motion: gradients, the 3D objects, and the small
// animations that make money feel like it moves. Everything respects the
// phone's Reduce Motion setting.
import React, { useEffect, useRef, useState } from "react";
import { View, Image, Animated, Easing, AccessibilityInfo, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { C } from "../theme/theme";

export const GRAD = {
  // Onboarding, payday and other full-screen brand moments.
  night: ["#2E31B8", "#1A1D6E", "#0B0F2E"],
  // Hero cards: a lit indigo that deepens toward the bottom.
  indigo: ["#5457EE", "#3538CD", "#2628A3"],
  // Buttons: subtle, so they still read as flat.
  button: ["#4245DD", "#3538CD"],
  // Money moments only.
  gold: ["#FFD84D", "#F5B800", "#E39C00"],
  ink: ["#1C2156", "#10153A"],
};

export function Gradient({ preset = "indigo", colors, style, children, start = { x: 0, y: 0 }, end = { x: 1, y: 1 }, ...rest }) {
  return (
    <LinearGradient colors={colors || GRAD[preset]} start={start} end={end} style={style} {...rest}>
      {children}
    </LinearGradient>
  );
}

const ASSETS = {
  vault: require("../../assets/3d/vault.png"),
  coin: require("../../assets/3d/coin.png"),
  wallet: require("../../assets/3d/wallet.png"),
  shield: require("../../assets/3d/shield.png"),
  padlock: require("../../assets/3d/padlock.png"),
};

export function Asset({ name, size = 120, style }) {
  return <Image source={ASSETS[name]} style={[{ width: size, height: size }, style]} resizeMode="contain" accessibilityIgnoresInvertColors />;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => alive && setReduced(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v) => setReduced(!!v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);
  return reduced;
}

// A slow bob, like something resting on water. Offset `delay` so groups of
// objects drift out of sync.
export function Float({ children, amplitude = 8, duration = 2600, delay = 0, rotate = 0, style }) {
  const reduced = useReducedMotion();
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration, delay, reduced]);
  const transform = [
    { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] }) },
  ];
  if (rotate) transform.push({ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${rotate}deg`] }) });
  return <Animated.View style={[{ transform }, style]}>{children}</Animated.View>;
}

// Soft concentric glow to lift a 3D object off a dark background.
export function Glow({ size = 220, color = "#FFFFFF", strength = 0.08, style }) {
  return (
    <View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      {[1, 0.74, 0.5].map((k, i) => (
        <View
          key={k}
          style={{
            position: "absolute", width: size * k, height: size * k, borderRadius: (size * k) / 2,
            backgroundColor: color, opacity: strength * (i + 1),
          }}
        />
      ))}
    </View>
  );
}

// Expanding rings, used behind the shield.
export function Pulse({ size = 180, color = C.safe, style }) {
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(a, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [a, reduced]);
  return (
    <View pointerEvents="none" style={[{ position: "absolute", width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      {[0, 0.5].map((offset) => {
        const p = Animated.modulo(Animated.add(a, offset), 1);
        return (
          <Animated.View
            key={offset}
            style={{
              position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color,
              opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
              transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.1] }) }],
            }}
          />
        );
      })}
    </View>
  );
}

// Haptics are a bonus: silent on web and on phones without a motor.
const buzz = (fn) => { if (Platform.OS !== "web") fn().catch?.(() => {}); };
export const haptic = {
  success: () => buzz(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => buzz(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => buzz(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  tap: () => buzz(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
};
