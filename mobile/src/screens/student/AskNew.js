import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, TopBar, T, Chip, Field, Button, Notice, Card } from "../../components/UI";
import { useStore } from "../../state/store";
import { REASON_ICON } from "./StudentAsks";

const REASONS = ["Books", "Health", "Transport", "Data", "Hostel", "Food", "Other"];

export default function AskNew({ navigation }) {
  const { state, actions } = useStore();
  const sponsor = state.sponsor.first;
  const [amount, setAmount] = useState("15");
  const [reason, setReason] = useState("Books");
  const [note, setNote] = useState("GST 211 textbook from the department");
  const [photo, setPhoto] = useState(false);
  const [sent, setSent] = useState(false);

  const n = Number(amount) || 0;
  const send = () => {
    actions.newAsk({ amount: n, reason, note: note.trim(), photo });
    setSent(true);
  };

  if (sent) {
    return (
      <Screen footer={<Button label="Done" onPress={() => navigation.goBack()} />}>
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <View style={{ width: 84, height: 84, borderRadius: 28, backgroundColor: C.indigoTint, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="paper-plane" size={38} color={C.indigo} />
          </View>
          <T w="heavy" size={24} style={{ marginTop: 18 }}>Ask sent to {sponsor}</T>
          <T size={14} color={C.muted} style={{ marginTop: 6, textAlign: "center", lineHeight: 20 }}>
            {usd(n)} for {reason.toLowerCase()}. If approved, it lands in your Cleva account in minutes.
          </T>
          <Notice icon="people" style={{ marginTop: 22 }}>
            If {sponsor} doesn't answer within 6 hours, {state.plan?.backup?.name || "your backup approver"} can approve it.
          </Notice>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label={`Send ask to ${sponsor}`} icon="paper-plane" onPress={send} disabled={n <= 0 || !reason} />}>
      <TopBar onBack={() => navigation.goBack()} title="Ask for extra" sub={`Say what it's for. A receipt photo helps ${sponsor} say yes faster.`} />
      <Field label="Amount" prefix="$" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" hint={n ? `≈ ${naira(toNaira(n))}` : undefined} />
      <T w="semi" size={13} color={C.muted} style={{ marginBottom: 8 }}>What's it for?</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
        {REASONS.map((r) => (
          <Chip key={r} label={r} icon={REASON_ICON[r]} selected={reason === r} onPress={() => setReason(r)} />
        ))}
      </View>
      <Field label="Note" value={note} onChangeText={setNote} placeholder="e.g. GST 211 textbook" multiline />
      <Pressable onPress={() => setPhoto(!photo)}>
        <Card tone={photo ? "safe" : "default"} style={{ flexDirection: "row", alignItems: "center", borderStyle: photo ? "solid" : "dashed" }}>
          <Ionicons name={photo ? "document-attach" : "camera"} size={22} color={photo ? C.safe : C.indigo} style={{ marginRight: 12 }} />
          <T w="semi" style={{ flex: 1 }}>{photo ? "receipt.jpg attached" : "Add a receipt or invoice photo"}</T>
          {photo ? <Ionicons name="close-circle" size={20} color={C.muted} /> : null}
        </Card>
      </Pressable>
      {n > 0 && n < 10 ? (
        <Notice icon="information-circle" tone="gold">
          Cleva can't receive less than $10 at once, so if approved this joins your next payday.
        </Notice>
      ) : null}
    </Screen>
  );
}
