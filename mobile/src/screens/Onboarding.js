import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../theme/theme";
import { Cta } from "../components/UI";
import { linkOpay } from "../api/client";

const SLIDES = [
  {
    emoji: "📍",
    eyebrow: "BEFORE YOU BUY",
    title: "See the real price near you",
    body: "People around you share what they actually paid. Check it first, then buy where it's cheapest — no more guessing.",
  },
  {
    emoji: "✨",
    eyebrow: "NO TYPING, NO STRESS",
    title: "Your spending, sorted for you",
    body: "Savi reads who you paid and sorts it into food, transport, data and more — on its own. Then it shows you where to spend less without living worse.",
  },
  {
    emoji: "🛡️",
    eyebrow: "ALWAYS WATCHING",
    title: "Guarded from scams & waste",
    body: "Savi warns you before a payment looks like fraud, and flags silent debits before they drain you. It only warns — it never touches your money.",
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(-1); // -1 = welcome, 0..2 = slides, 3 = connect

  if (step === -1) {
    return (
      <View style={[st.wrap, { backgroundColor: C.royalDeep }]}>
        <View style={st.center}>
          <View style={st.logo}><Text style={{ fontSize: 42 }}>📍</Text></View>
          <Text style={st.brand}>Savi</Text>
          <Text style={st.tag}>Spend like you <Text style={{ fontStyle: "italic", color: C.goldSoft }}>sabi</Text>.</Text>
        </View>
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
        <View style={[st.center, { paddingHorizontal: 28 }]}>
          <Text style={st.h}>Two quick permissions</Text>
          <Text style={st.p}>You're in control — change either any time in settings.</Text>
          <View style={st.perm}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.permT}>Connect your OPay account</Text>
              <Text style={st.permS}>So Savi can sort your spending for you. It only reads — it can never move your money.</Text>
            </View>
          </View>
          <View style={st.perm}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.permT}>Share your location</Text>
              <Text style={st.permS}>So we can show prices near you and pin your finds to the right market.</Text>
            </View>
          </View>
        </View>
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
      <TouchableOpacity style={st.skip} onPress={onDone}>
        <Text style={{ color: C.muted, fontWeight: "600" }}>Skip</Text>
      </TouchableOpacity>
      <View style={[st.center, { paddingHorizontal: 32 }]}>
        <View style={st.art}><Text style={{ fontSize: 64 }}>{s.emoji}</Text></View>
        <Text style={st.eyebrow}>{s.eyebrow}</Text>
        <Text style={st.h}>{s.title}</Text>
        <Text style={st.p}>{s.body}</Text>
      </View>
      <View style={{ padding: 24 }}>
        <View style={st.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[st.dot, i === step && st.dotOn]} />
          ))}
        </View>
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
  logo: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: C.royal,
    alignItems: "center", justifyContent: "center", marginBottom: 22,
  },
  brand: { fontSize: 48, fontWeight: "800", color: "#fff" },
  tag: { fontSize: 16, color: "#CFE0D5", marginTop: 10 },
  skip: { alignSelf: "flex-end", padding: 20 },
  art: {
    width: 160, height: 160, borderRadius: 36, backgroundColor: C.mint,
    alignItems: "center", justifyContent: "center", marginBottom: 26,
  },
  eyebrow: { fontSize: 11, letterSpacing: 2, color: C.royal, fontWeight: "700", marginBottom: 12 },
  h: { fontSize: 28, fontWeight: "800", color: C.ink, textAlign: "center" },
  p: { fontSize: 14.5, color: C.muted, textAlign: "center", marginTop: 12, lineHeight: 21 },
  dots: { flexDirection: "row", justifyContent: "center", marginBottom: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.mint2, marginHorizontal: 3 },
  dotOn: { width: 22, backgroundColor: C.royal },
  perm: {
    flexDirection: "row", backgroundColor: "#fff", borderWidth: 1,
    borderColor: C.line, borderRadius: 16, padding: 16, marginTop: 12, width: "100%",
  },
  permT: { fontWeight: "700", color: C.ink, fontSize: 14 },
  permS: { color: C.muted, fontSize: 12, marginTop: 3, lineHeight: 17 },
});
