import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, TopBar, T, Card, Button, Pill, Notice, IconChip } from "../../components/UI";
import { useStore, fmtDay } from "../../state/store";
import { REASON_ICON } from "../student/StudentAsks";

export default function AskDetail({ navigation, route }) {
  const { state, actions } = useStore();
  const ask = state.asks.find((k) => k.id === route.params?.id);
  const kid = state.student.first;
  const [result, setResult] = useState(null);
  if (!ask) return null;

  if (result) {
    const yes = result === "approved";
    return (
      <Screen footer={<Button label="Done" onPress={() => navigation.goBack()} />}>
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: yes ? C.gold : C.indigoTint, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={yes ? "checkmark-sharp" : "close"} size={44} color={yes ? C.ink : C.indigo} />
          </View>
          <T w="heavy" size={24} style={{ marginTop: 18, textAlign: "center" }}>
            {yes ? `${usd(ask.amount)} is on its way to ${kid}` : "Declined"}
          </T>
          <T size={14} color={C.muted} style={{ marginTop: 6, textAlign: "center" }}>
            {yes ? `Into ${kid}'s Cleva account · ≈ ${naira(toNaira(ask.amount))}` : `${kid} will see you said no this time.`}
          </T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        ask.status === "pending" ? (
          <View>
            <Button label={`Approve ${usd(ask.amount)}`} icon="checkmark-circle" onPress={() => { actions.resolveAsk(ask.id, true); setResult("approved"); }} />
            <Button label="Decline" variant="ghost" onPress={() => { actions.resolveAsk(ask.id, false); setResult("declined"); }} />
          </View>
        ) : null
      }
    >
      <TopBar onBack={() => navigation.goBack()} title={`${kid} asks for ${usd(ask.amount)}`} sub={`≈ ${naira(toNaira(ask.amount))} · ${fmtDay(ask.at)}`} />

      <Card tone="safe" style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="shield-checkmark" size={22} color={C.safe} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <T w="bold" color={C.safeInk}>Sent from {kid}'s verified account</T>
          <T size={12.5} color={C.safeInk}>Identity checked by Cleva · same phone as always</T>
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconChip icon={REASON_ICON[ask.reason] || "chatbubble"} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <T w="heavy" size={16}>{ask.reason}</T>
            <T size={13.5} color={C.ink} style={{ marginTop: 2 }}>{ask.note || "No note"}</T>
          </View>
        </View>
        {ask.photo ? (
          <View style={{ marginTop: 14, height: 120, borderRadius: 14, backgroundColor: "#F3F4F8", borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="receipt" size={34} color={C.faint} />
            <T w="semi" size={12.5} color={C.muted} style={{ marginTop: 6 }}>receipt.jpg</T>
          </View>
        ) : null}
      </Card>

      {ask.status !== "pending" ? (
        <Pill text={ask.status === "approved" ? "Approved" : "Declined"} tone={ask.status === "approved" ? "safe" : "muted"} />
      ) : (
        <Notice icon="flash">If you approve, it lands in {kid}'s Cleva account in minutes. Your vault isn't touched; this is a top-up from your wallet.</Notice>
      )}
    </Screen>
  );
}
