import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd } from "../../theme/theme";
import { Screen, TopBar, T, Card, Button, Notice } from "../../components/UI";
import { useStore } from "../../state/store";

export default function ScamCheck({ navigation }) {
  const { state } = useStore();
  const kid = state.student.first;
  const open = state.asks.filter((k) => k.status === "pending");
  const [reported, setReported] = useState(false);

  return (
    <Screen
      footer={
        <View>
          <Button label={reported ? "Number reported. Thank you" : "Report the number that messaged me"} variant={reported ? "ghost" : "danger"} icon="flag" disabled={reported} onPress={() => setReported(true)} />
          <Button label={`Message ${kid} in Wellsent`} variant="ghost" icon="chatbubbles" onPress={() => navigation.goBack()} />
        </View>
      }
    >
      <TopBar onBack={() => navigation.goBack()} title={`Is this really ${kid}?`} sub="Someone asking for money on a new number, a call or WhatsApp? Check here first." />

      {open.length === 0 ? (
        <Card tone="safe" style={{ alignItems: "center", paddingVertical: 30 }}>
          <Ionicons name="shield-checkmark" size={64} color={C.safe} />
          <T w="heavy" size={24} color={C.safeInk} style={{ marginTop: 12, textAlign: "center" }}>{kid} has no open requests.</T>
          <T size={14} color={C.safeInk} style={{ marginTop: 8, textAlign: "center", lineHeight: 20 }}>
            Any message asking you for money outside Wellsent is not from {kid}'s account. Don't send.
          </T>
        </Card>
      ) : (
        <Card tone="caution" style={{ paddingVertical: 22 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="alert-circle" size={30} color={C.caution} style={{ marginRight: 10 }} />
            <T w="heavy" size={19} color={C.cautionInk} style={{ flex: 1 }}>
              {kid} has {open.length} open request{open.length > 1 ? "s" : ""}, all inside Wellsent
            </T>
          </View>
          {open.map((k) => (
            <T key={k.id} w="semi" size={15} style={{ marginTop: 10 }}>• {usd(k.amount)} for {k.reason.toLowerCase()}: “{k.note}”</T>
          ))}
          <T size={13.5} color={C.cautionInk} style={{ marginTop: 12, lineHeight: 20 }}>
            If someone is asking for a different amount, or outside the app, it isn't {kid}. Only approve requests here.
          </T>
          <Button small label="See the request" variant="dark" style={{ marginTop: 14 }} onPress={() => navigation.navigate("AskDetail", { id: open[0].id })} />
        </Card>
      )}

      <Notice icon="information-circle">
        {kid} agreed to ask only through Wellsent. Every request comes from their verified account and shows here.
      </Notice>
    </Screen>
  );
}
