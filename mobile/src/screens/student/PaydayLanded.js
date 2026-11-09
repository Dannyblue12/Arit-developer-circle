import React, { useEffect, useRef } from "react";
import { View, Animated, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, Card, T, Button, ListItem } from "../../components/UI";
import { useStore, fmtDay } from "../../state/store";
import { Gradient, Asset, Glow, haptic, useReducedMotion } from "../../components/Brand";

export default function PaydayLanded({ navigation }) {
  const { state } = useStore();
  const last = state.lastPayday;
  const tx = state.activity.find((a) => a.type === "payday")?.tx || "";
  const coin = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { coin.setValue(1); text.setValue(1); haptic.success(); return; }
    Animated.sequence([
      Animated.spring(coin, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.timing(text, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(haptic.success, 380); // buzz as the coin lands
    return () => clearTimeout(t);
  }, [coin, text, reduced]);

  if (!last) return null;

  return (
    <Gradient preset="night" start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
    <Screen
      bg="transparent"
      footer={
        <View>
          <Button label="Open Cleva" variant="gold" icon="open-outline" onPress={() => Linking.openURL("https://www.getcleva.com")} />
          <Button label="Back to home" variant="light" onPress={() => navigation.goBack()} />
        </View>
      }
    >
      <StatusBar style="light" />
      <View style={{ alignItems: "center", marginTop: 18 }}>
        <View style={{ width: 220, height: 200, alignItems: "center", justifyContent: "center" }}>
          <Glow size={230} color={C.gold} strength={0.07} />
          <Animated.View
            style={{
              transform: [
                { translateY: coin.interpolate({ inputRange: [0, 1], outputRange: [-220, 0] }) },
                { rotate: coin.interpolate({ inputRange: [0, 1], outputRange: ["-200deg", "0deg"] }) },
                { scale: coin.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              ],
              opacity: coin.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
            }}
          >
            <Asset name="coin" size={170} />
          </Animated.View>
          <View style={{ position: "absolute", bottom: 4, right: 30, width: 40, height: 40, borderRadius: 20, backgroundColor: C.safe, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#1A1D6E" }}>
            <Ionicons name="checkmark-sharp" size={22} color="#fff" />
          </View>
        </View>
        <Animated.View style={{ alignItems: "center", opacity: text }}>
          <T w="heavy" size={28} color="#fff" style={{ marginTop: 24, textAlign: "center" }}>
            Your {usd(last.amount)} don land! 🎉
          </T>
          <T w="semi" size={15} color="#C9CCF5" style={{ marginTop: 6, textAlign: "center" }}>
            It's in your Cleva account · ≈ {naira(toNaira(last.amount))}
          </T>
          <T size={12.5} color="#8E93CF" style={{ marginTop: 4 }}>
            {fmtDay(last.at)} · {state.cleva?.network} · from {state.sponsor.first}
          </T>
        </Animated.View>
      </View>

      <Card style={{ marginTop: 30, paddingVertical: 4 }}>
        <T w="bold" size={12} color={C.muted} style={{ marginTop: 12, letterSpacing: 1 }}>WHAT NEXT, IN CLEVA</T>
        <ListItem icon="swap-horizontal" title="Change to naira" subtitle="Into any Nigerian bank account" />
        <ListItem icon="logo-usd" title="Keep it in dollars" subtitle="Your Cleva USD balance holds its value" />
        <ListItem icon="card" title="Pay online with your Cleva card" subtitle="IELTS, courses, apps and subscriptions" last />
      </Card>
      <T size={11.5} color="#7E84C2" style={{ textAlign: "center", marginTop: 4 }}>
        Proof on the blockchain: {tx.slice(0, 6)}…{tx.slice(-6)}
      </T>
    </Screen>
    </Gradient>
  );
}
