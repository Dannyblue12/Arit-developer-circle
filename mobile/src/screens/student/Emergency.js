import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, TopBar, T, Chip, Button, Notice, Card } from "../../components/UI";
import { useStore, canUseEmergency } from "../../state/store";
import { Asset, Float, Glow, haptic } from "../../components/Brand";

const REASONS = [
  ["Health", "medkit"], ["Travel home", "bus"], ["Exam or school", "school"], ["Accident or safety", "alert-circle"], ["Other", "ellipsis-horizontal"],
];

export default function Emergency({ navigation }) {
  const { state, actions } = useStore();
  const p = state.plan;
  const sponsor = state.sponsor.first;
  const left = p?.emergencyLeft || 0;
  const options = [10, 20, 30].filter((v) => v < left).concat(left >= 10 ? [left] : []);
  const [reason, setReason] = useState("Health");
  const [amount, setAmount] = useState(options.includes(30) ? 30 : options[0]);
  const [done, setDone] = useState(null);

  const unlock = () => {
    actions.spendEmergency({ reason, amount });
    haptic.success();
    setDone({ amount, reason });
  };

  if (done) {
    return (
      <Screen footer={<Button label="Back to home" onPress={() => navigation.goBack()} />}>
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <View style={{ width: 170, height: 150, alignItems: "center", justifyContent: "center" }}>
            <Glow size={170} color={C.gold} strength={0.08} />
            <Float amplitude={6}><Asset name="coin" size={130} /></Float>
          </View>
          <T w="heavy" size={24} style={{ marginTop: 18, textAlign: "center" }}>{usd(done.amount)} is on its way to Cleva</T>
          <T size={14} color={C.muted} style={{ marginTop: 6 }}>≈ {naira(toNaira(done.amount))} · usually within minutes</T>
          <Notice icon="notifications" style={{ marginTop: 22 }}>
            {sponsor} has been told: “{state.student.first} used {usd(done.amount)} emergency money for {done.reason.toLowerCase()}.” They weren't asked. It's your pot.
          </Notice>
          <T w="semi" size={14} color={C.ink} style={{ marginTop: 8 }}>Take care of yourself. 💛</T>
        </View>
      </Screen>
    );
  }

  const ok = canUseEmergency(p) && amount >= 10;

  return (
    <Screen footer={<Button label={`Unlock ${usd(amount || 0)} now`} icon="flash" onPress={unlock} disabled={!ok} />}>
      <TopBar onBack={() => navigation.goBack()} title="Emergency money" sub="For when something can't wait. No approval needed." />
      <Card gradient="gold" style={{ flexDirection: "row", alignItems: "center", overflow: "hidden", paddingVertical: 12 }}>
        <View style={{ flex: 1 }}>
          <T w="bold" size={12} color={C.goldInk} style={{ letterSpacing: 1 }}>YOUR EMERGENCY POT</T>
          <T w="heavy" size={30} color={C.ink} style={{ letterSpacing: -0.6 }}>{usd(left)}</T>
          <T size={12.5} color={C.goldInk}>Ready now · once a month · no approval</T>
        </View>
        <Float amplitude={5} rotate={6}><Asset name="coin" size={86} /></Float>
      </Card>
      <T w="semi" size={13} color={C.muted} style={{ marginTop: 10, marginBottom: 8 }}>What happened?</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {REASONS.map(([r, icon]) => (
          <Chip key={r} label={r} icon={icon} selected={reason === r} onPress={() => setReason(r)} />
        ))}
      </View>
      <T w="semi" size={13} color={C.muted} style={{ marginTop: 10, marginBottom: 8 }}>How much?</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {options.map((v) => (
          <Chip key={v} label={v === left ? `All ${usd(v)}` : usd(v)} selected={amount === v} onPress={() => setAmount(v)} />
        ))}
      </View>
      <Notice icon="notifications" style={{ marginTop: 10 }}>
        {sponsor} will be told, not asked. Anything you don't use comes to you at the end of the plan.
      </Notice>
    </Screen>
  );
}
