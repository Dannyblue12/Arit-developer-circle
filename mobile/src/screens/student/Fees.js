import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd } from "../../theme/theme";
import { Screen, TopBar, T, Button, Notice, Card, Field, Pill } from "../../components/UI";
import { useStore } from "../../state/store";
import { Asset } from "../../components/Brand";

const STEPS = [
  ["reserved", "Reserved in your vault"],
  ["invoice", "Invoice sent for confirmation"],
  ["paid", "Paid to the school's official channel"],
];

export default function Fees({ navigation }) {
  const { state, actions } = useStore();
  const p = state.plan;
  const sponsor = state.sponsor.first;
  const [ref, setRef] = useState("2100-4417-9032");
  if (!p) return null;
  const idx = STEPS.findIndex(([k]) => k === p.feesStatus);

  return (
    <Screen
      footer={
        p.feesStatus === "reserved" ? (
          <Button label={`Send to ${sponsor} to confirm`} icon="paper-plane" onPress={() => actions.setFees("invoice", ref)} disabled={ref.trim().length < 6} />
        ) : p.feesStatus === "invoice" ? (
          <Button label="Mark paid (demo)" variant="dark" icon="flash" onPress={() => actions.setFees("paid")} />
        ) : (
          <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} />
        )
      }
    >
      <TopBar onBack={() => navigation.goBack()} title="School fees" sub="Fees only go to the school's official channel. Never to a person." />
      <Card gradient="indigo" style={{ flexDirection: "row", alignItems: "center", overflow: "hidden", paddingVertical: 12 }}>
        <View style={{ flex: 1 }}>
          <T w="bold" size={12} color={C.gold} style={{ letterSpacing: 1 }}>LOCKED FOR SCHOOL FEES</T>
          <T w="heavy" size={30} color="#fff" style={{ letterSpacing: -0.6 }}>{usd(p.fees)}</T>
          <T size={12.5} color="#DADCFF">{p.feesSchool} · deadline {p.feesDeadline}</T>
        </View>
        <Asset name="padlock" size={88} />
      </Card>

      <Card>
        {STEPS.map(([k, label], i) => {
          const on = i <= idx;
          return (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
              <Ionicons name={on ? "checkmark-circle" : "ellipse-outline"} size={22} color={on ? C.indigo : C.faint} style={{ marginRight: 10 }} />
              <T w={on ? "bold" : "regular"} color={on ? C.ink : C.muted}>{label}</T>
            </View>
          );
        })}
      </Card>

      {p.feesStatus === "reserved" ? (
        <Field label="Remita RRR or invoice number" value={ref} onChangeText={setRef} keyboardType="number-pad" hint="From the UNIUYO e-portal. The school's name is checked before paying." />
      ) : null}

      {p.feesStatus === "paid" ? (
        <Card tone="safe">
          <T w="heavy" size={15} color={C.safeInk}>Receipt</T>
          <T size={13} style={{ marginTop: 6 }}>Paid {usd(p.fees)} to {p.feesSchool}</T>
          <T size={13}>Reference: {p.feesRef || ref}</T>
          <T size={13}>Receipt no.: WS-FEES-0042</T>
        </Card>
      ) : null}

      <Notice icon="information-circle">
        In this prototype the payment step is simulated. Live, it goes through a payment partner such as Remita or Cleva's naira payouts.
      </Notice>
    </Screen>
  );
}
