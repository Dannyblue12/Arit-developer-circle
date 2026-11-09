// First run: a four-beat story told with the 3D objects, then "who are you?".
// Swipe or tap Next; Skip jumps to the choice. Art moves slower than the
// text as you swipe (parallax), and every object drifts gently at rest.
import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Pressable, useWindowDimensions, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../theme/theme";
import { T, Button, pressFx } from "../../components/UI";
import { Gradient, Asset, Float, Glow, Pulse, useReducedMotion } from "../../components/Brand";
import { LogoMark, Wordmark } from "../../components/Logo";

const ART_H = 300;

// A coin that keeps dropping into whatever sits below it.
function DroppingCoin({ size = 70, distance = 120, delay = 0 }) {
  const reduced = useReducedMotion();
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, { toValue: 1, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [y, delay, reduced]);
  return (
    <Animated.View
      style={{
        position: "absolute",
        opacity: y.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: y.interpolate({ inputRange: [0, 1], outputRange: [-distance, 0] }) },
          { rotate: y.interpolate({ inputRange: [0, 1], outputRange: ["-25deg", "15deg"] }) },
          { scale: y.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 0.9, 0.5] }) },
        ],
      }}
    >
      <Asset name="coin" size={size} />
    </Animated.View>
  );
}

function HeroArt() {
  return (
    <View style={{ height: ART_H, alignItems: "center", justifyContent: "center" }}>
      <Glow size={280} color="#8E91FF" strength={0.07} />
      <Float amplitude={10} duration={2800}><Asset name="vault" size={200} /></Float>
      <Float amplitude={12} duration={2300} delay={300} rotate={8} style={{ position: "absolute", top: 18, right: 34 }}>
        <Asset name="coin" size={92} />
      </Float>
      <Float amplitude={8} duration={2600} delay={700} rotate={-6} style={{ position: "absolute", bottom: 26, left: 30 }}>
        <Asset name="shield" size={86} />
      </Float>
      <Float amplitude={6} duration={2000} delay={500} style={{ position: "absolute", top: 70, left: 52 }}>
        <Asset name="coin" size={44} style={{ opacity: 0.9 }} />
      </Float>
    </View>
  );
}

function PaydayArt() {
  return (
    <View style={{ height: ART_H, alignItems: "center", justifyContent: "center" }}>
      <Glow size={260} color={C.gold} strength={0.06} />
      <View style={{ alignItems: "center", justifyContent: "center", marginTop: 40 }}>
        <DroppingCoin size={78} distance={150} />
        <Float amplitude={4} duration={2400}><Asset name="vault" size={190} /></Float>
      </View>
      <View style={{ position: "absolute", top: 26, right: 26, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }}>
        <T w="bold" size={12} color={C.gold}>EVERY MONDAY</T>
        <T w="heavy" size={20} color="#fff">+$21.25</T>
      </View>
    </View>
  );
}

function ShieldArt() {
  return (
    <View style={{ height: ART_H, alignItems: "center", justifyContent: "center" }}>
      <Pulse size={250} color="#5FE3B0" />
      <Float amplitude={10} duration={2600}><Asset name="shield" size={200} /></Float>
      <View style={{ position: "absolute", bottom: 22, left: 22, backgroundColor: "rgba(217,45,32,0.18)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="close-circle" size={14} color="#FF8A80" style={{ marginRight: 6 }} />
        <T w="semi" size={12} color="#FFD3CF">“New number, send ₦50k”</T>
      </View>
    </View>
  );
}

function WalletArt() {
  return (
    <View style={{ height: ART_H, alignItems: "center", justifyContent: "center" }}>
      <Glow size={260} color="#FFFFFF" strength={0.06} />
      <View style={{ alignItems: "center", justifyContent: "center", marginTop: 30 }}>
        <DroppingCoin size={66} distance={140} delay={200} />
        <Float amplitude={6} duration={2500} rotate={-3}><Asset name="wallet" size={200} /></Float>
      </View>
      <View style={{ position: "absolute", top: 30, left: 24, flexDirection: "row", gap: 6 }}>
        {["₦ Naira", "$ Dollars", "Card"].map((t) => (
          <View key={t} style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
            <T w="bold" size={11.5} color="#fff">{t}</T>
          </View>
        ))}
      </View>
    </View>
  );
}

const PAGES = [
  { key: "hero", Art: HeroArt },
  { key: "payday", Art: PaydayArt, eyebrow: "MONEY THAT LASTS", title: "A payday every Monday", body: "Family abroad set up a plan once. A fixed amount unlocks every week, so the money lasts the whole semester." },
  { key: "shield", Art: ShieldArt, eyebrow: "SAFE FROM SCAMS", title: "Only real requests get through", body: "Requests come only from your verified account, and Shield checks every payment before it leaves." },
  { key: "wallet", Art: WalletArt, eyebrow: "STRAIGHT INTO CLEVA", title: "Lands in your Cleva wallet", body: "Change it to naira, keep dollars, or pay online with your Cleva card. Your money, your choice." },
  { key: "choose" },
];

function RoleCard({ asset, title, sub, onPress, primary }) {
  return (
    <Pressable onPress={onPress} style={pressFx} accessibilityRole="button">
      <View
        style={{
          flexDirection: "row", alignItems: "center", borderRadius: 22, padding: 14, marginTop: 12,
          backgroundColor: primary ? "#FFFFFF" : "rgba(255,255,255,0.08)",
          borderWidth: 1, borderColor: primary ? "#FFFFFF" : "rgba(255,255,255,0.2)",
        }}
      >
        <Asset name={asset} size={64} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <T w="heavy" size={17} color={primary ? C.ink : "#fff"}>{title}</T>
          <T size={13} color={primary ? C.muted : "#C9CCF5"} style={{ marginTop: 2 }}>{sub}</T>
        </View>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: primary ? C.indigo : "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}

export default function Welcome({ navigation }) {
  const { width: W } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const ref = useRef(null);
  const [page, setPage] = useState(0);
  const [pageH, setPageH] = useState(0);
  const last = PAGES.length - 1;

  useEffect(() => {
    const id = scrollX.addListener(({ value }) => setPage(Math.round(value / W)));
    return () => scrollX.removeListener(id);
  }, [scrollX, W]);

  const go = (i) => ref.current?.scrollTo({ x: i * W, animated: true });

  return (
    <Gradient preset="night" start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: Math.max(insets.top, 12) + 6, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" }}>
        <LogoMark size={30} />
        <View style={{ marginLeft: 8, flex: 1 }}><Wordmark size={19} color="#fff" /></View>
        {page < last ? (
          <Pressable onPress={() => go(last)} hitSlop={12} accessibilityRole="button">
            <T w="semi" size={14} color="#C9CCF5">Skip</T>
          </Pressable>
        ) : null}
      </View>

      <Animated.ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onLayout={(e) => setPageH(e.nativeEvent.layout.height)}
        style={{ flex: 1 }}
      >
        {PAGES.map((p, i) => {
          const range = [(i - 1) * W, i * W, (i + 1) * W];
          const artShift = scrollX.interpolate({ inputRange: range, outputRange: [W * 0.35, 0, -W * 0.35], extrapolate: "clamp" });
          const fade = scrollX.interpolate({ inputRange: range, outputRange: [0, 1, 0], extrapolate: "clamp" });
          return (
            <View key={p.key} style={{ width: W, height: pageH || undefined, paddingHorizontal: 24, justifyContent: "center" }}>
              {p.key === "hero" ? (
                <Animated.View style={{ opacity: fade }}>
                  <Animated.View style={{ transform: [{ translateX: artShift }] }}><HeroArt /></Animated.View>
                  <T w="heavy" size={42} color="#fff" style={{ letterSpacing: -1.2, marginTop: 6 }}>
                    Money well sent<T w="heavy" size={42} color={C.gold}>.</T>
                  </T>
                  <T size={16} color="#C9CCF5" style={{ marginTop: 10, lineHeight: 24 }}>
                    The safe way for family abroad to support a student at home. Weekly paydays, straight into Cleva.
                  </T>
                  <T w="semi" size={14} color={C.gold} style={{ marginTop: 14 }}>Send am. Sleep well.</T>
                </Animated.View>
              ) : p.key === "choose" ? (
                <Animated.View style={{ opacity: fade }}>
                  <View style={{ alignItems: "center", marginBottom: 6 }}>
                    <Float amplitude={6}><Asset name="coin" size={96} /></Float>
                  </View>
                  <T w="heavy" size={30} color="#fff" style={{ letterSpacing: -0.8, textAlign: "center" }}>How will you use Wellsent?</T>
                  <T size={14.5} color="#C9CCF5" style={{ textAlign: "center", marginTop: 8, marginBottom: 10 }}>
                    Students and supporters each get their own simple app.
                  </T>
                  <RoleCard primary asset="wallet" title="I'm a student" sub="Get weekly paydays from family" onPress={() => navigation.navigate("SignUp", { role: "student" })} />
                  <RoleCard asset="vault" title="I support a student" sub="Send money that lasts the month" onPress={() => navigation.navigate("SignUp", { role: "sponsor" })} />
                </Animated.View>
              ) : (
                <Animated.View style={{ opacity: fade }}>
                  <Animated.View style={{ transform: [{ translateX: artShift }] }}><p.Art /></Animated.View>
                  <T w="bold" size={12} color={C.gold} style={{ letterSpacing: 1.6, marginTop: 4 }}>{p.eyebrow}</T>
                  <T w="heavy" size={30} color="#fff" style={{ letterSpacing: -0.8, marginTop: 8 }}>{p.title}</T>
                  <T size={15.5} color="#C9CCF5" style={{ marginTop: 10, lineHeight: 23 }}>{p.body}</T>
                </Animated.View>
              )}
            </View>
          );
        })}
      </Animated.ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 18) + 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16 }}>
          {PAGES.map((p, i) => (
            <View
              key={p.key}
              style={{
                height: 7, borderRadius: 4, marginHorizontal: 3, width: i === page ? 24 : 7,
                backgroundColor: i === page ? C.gold : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </View>
        {page < last ? (
          <Button label={page === 0 ? "See how it works" : "Next"} variant="gold" icon="arrow-forward" onPress={() => go(page + 1)} />
        ) : (
          <T size={12} color="#8E93CF" style={{ textAlign: "center" }}>Paydays arrive through Cleva · Built for the Cleva × Tether hackathon</T>
        )}
      </View>
    </Gradient>
  );
}
