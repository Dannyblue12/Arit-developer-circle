import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/theme";
import { Cta, IconChip } from "../components/UI";
import { linkOpay } from "../api/client";

const SLIDES = [
  {
    icon: "location",
    eyebrow: "BEFORE YOU BUY",
    title: "See the real price near you",
    body: "People around you share what they actually paid. Check it first, then buy where it's cheapest — no more guessing.",
  },
  {
    icon: "sparkles",
    eyebrow: "NO TYPING, NO STRESS",
    title: "Your spending, sorted for you",
    body: "Savi reads who you paid and sorts it into food, transport, data and more — on its own. Then it shows you where to spend less without living worse.",
  },
  {
    icon: "shield-checkmark",
    eyebrow: "ALWAYS WATCHING",
    title: "Guarded from scams & waste",
    body: "Savi warns you before a payment looks like fraud, and flags silent debits before they drain you. It only warns — it never touches your money.",
  },
];

function Dots({ step }) {
  // One value drives every dot: each interpolates its own width/colour from
  // how far the active step is from it, so the active dot widens smoothly.
  const anim = useRef(new Animated.Value(step)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: step, duration: 250, useNativeDriver: false }).start();
  }, [step, anim]);
  return (
    <View style={st.dots}>
      {SLIDES.map((_, i) => (
        <Animated.View
          key={i}
          style={[
            st.dot,
            {
              width: anim.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [7, 22, 7],
                extrapolate: "clamp",
              }),
              backgroundColor: anim.interpolate({
                inputRange: [i - 0.5, i, i + 0.5],
                outputRange: [C.mint2, C.royal, C.mint2],
                extrapolate: "clamp",
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(-1); // -1 = welcome, 0..2 = slides, 3 = connect
  const anim = useRef(new Animated.Value(1)).current;

  // Each step change: content starts 24px right + transparent, settles in 250ms.
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [step, anim]);

  const slideIn = {
    opacity: anim,
    transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  };

  if (step === -1) {
    return (
      <View style={[st.wrap, { backgroundColor: C.brandDeep }]}>
        <StatusBar hidden />
        <Animated.View style={[st.center, { opacity: anim }]}>
          <Image source={require("../../assets/logo-mark.png")} style={st.logo} />
          <Text style={st.brand}>savi</Text>
          <Text style={st.tag}>spend like you <Text style={{ fontStyle: "italic", color: C.goldSoft }}>sabi</Text></Text>
        </Animated.View>
        <View style={{ padding: 24 }}>
          <Cta label="Get started" onPress={() => setStep(0)} />
          <Cta label="I already have an account" ghost onPress={onDone} />
        </View>
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={st.wrap}>
        <StatusBar hidden />
        <Animated.View style={[st.center, { paddingHorizontal: 28 }, slideIn]}>
          <Image source={require("../../assets/logo-mark.png")} style={st.markSm} />
          <Text style={st.h}>Two quick permissions</Text>
          <Text style={st.p}>You're in control — change either any time in settings.</Text>
          <View style={st.perm}>
            <IconChip icon="card" size={38} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={st.permT}>Connect your OPay account</Text>
              <Text style={st.permS}>So Savi can sort your spending for you. It only reads — it can never move your money.</Text>
            </View>
          </View>
          <View style={st.perm}>
            <IconChip icon="location" size={38} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={st.permT}>Share your location</Text>
              <Text style={st.permS}>So we can show prices near you and pin your finds to the right market.</Text>
            </View>
          </View>
        </Animated.View>
        <View style={{ padding: 24 }}>
          <Cta label="Allow & enter Savi" onPress={async () => { await linkOpay(); onDone(); }} />
          <Cta label="Maybe later" ghost onPress={onDone} />
        </View>
      </View>
    );
  }

  const s = SLIDES[step];
  return (
    <View style={st.wrap}>
      <StatusBar hidden />
      <TouchableOpacity style={st.skip} onPress={onDone} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={{ color: C.muted, fontWeight: "600" }}>Skip</Text>
      </TouchableOpacity>
      <Animated.View style={[st.center, { paddingHorizontal: 32 }, slideIn]}>
        <View style={st.art}><Ionicons name={s.icon} size={64} color={C.royal} /></View>
        <Text style={st.eyebrow}>{s.eyebrow}</Text>
        <Text style={st.h}>{s.title}</Text>
        <Text style={st.p}>{s.body}</Text>
      </Animated.View>
      <View style={{ padding: 24 }}>
        <Dots step={step} />
        <Cta
          label={step < SLIDES.length - 1 ? "Next" : "Set up my account"}
          onPress={() => setStep(step + 1)}
        />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.paper },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 118, height: 124, marginBottom: 26, resizeMode: "contain" },
  markSm: { width: 42, height: 44, marginBottom: 18, resizeMode: "contain" },
  brand: { fontSize: 46, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  tag: { fontSize: 16, color: "#CFE0D5", marginTop: 8, letterSpacing: 2.5 },
  skip: { alignSelf: "flex-end", padding: 20, paddingTop: 26 },
  art: {
    width: 160, height: 160, borderRadius: 36, backgroundColor: C.mint,
    alignItems: "center", justifyContent: "center", marginBottom: 26,
  },
  eyebrow: { fontSize: 11, letterSpacing: 2, color: C.royal, fontWeight: "700", marginBottom: 12 },
  h: { fontSize: 28, fontWeight: "800", color: C.ink, textAlign: "center" },
  p: { fontSize: 14.5, color: C.muted, textAlign: "center", marginTop: 12, lineHeight: 21 },
  dots: { flexDirection: "row", justifyContent: "center", marginBottom: 18 },
  dot: { height: 7, borderRadius: 4, marginHorizontal: 3 },
  perm: {
    flexDirection: "row", backgroundColor: "#fff", borderWidth: 1,
    borderColor: C.line, borderRadius: 16, padding: 16, marginTop: 12, width: "100%",
  },
  permT: { fontWeight: "700", color: C.ink, fontSize: 14 },
  permS: { color: C.muted, fontSize: 12, marginTop: 3, lineHeight: 17 },
});
