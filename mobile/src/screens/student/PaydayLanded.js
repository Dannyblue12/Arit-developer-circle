import React, { useEffect, useRef } from "react";
import { View, Animated, Linking } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, Card, T, Button, ListItem } from "../../components/UI";
import { useStore, fmtDay } from "../../state/store";

export default function PaydayLanded({ navigation }) {
  const { state } = useStore();
  const last = state.lastPayday;
  const tx = state.activity.find((a) => a.type === "payday")?.tx || "";
  const coin = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(coin, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.timing(text, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [coin, text]);

  if (!last) return null;

  return (
    <Screen
      bg={C.ink}
      footer={
        <View>
          <Button label="Open Cleva" variant="gold" icon="open-outline" onPress={() => Linking.openURL("https://www.getcleva.com")} />
          <Button label="Back to home" variant="light" onPress={() => navigation.goBack()} />
        </View>
      }
    >
      <StatusBar style="light" />
      <View style={{ alignItems: "center", marginTop: 30 }}>
        <Animated.View
          style={{
            width: 120, height: 120, borderRadius: 60, backgroundColor: C.gold, alignItems: "center", justifyContent: "center",
            transform: [
              { scale: coin.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
              { translateY: coin.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) },
            ],
            opacity: coin,
          }}
        >
          <Ionicons name="checkmark-sharp" size={70} color={C.ink} />
        </Animated.View>
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
  );
}
