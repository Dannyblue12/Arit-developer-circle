import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { C } from "../../theme/theme";
import { Screen, TopBar, T, Button, Notice, Field, Toggle, Card } from "../../components/UI";
import { useStore } from "../../state/store";

export const MOODS = [
  ["good", "🙂", "Good week"],
  ["okay", "😐", "Okay"],
  ["tough", "😟", "Tough week"],
];

export default function CheckIn({ navigation }) {
  const { state, actions } = useStore();
  const sponsor = state.sponsor.first;
  const [mood, setMood] = useState("good");
  const [note, setNote] = useState("");
  const [shared, setShared] = useState(true);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Screen footer={<Button label="Back to home" onPress={() => navigation.goBack()} />}>
        <View style={{ alignItems: "center", marginTop: 70 }}>
          <T size={64}>{MOODS.find((m) => m[0] === mood)[1]}</T>
          <T w="heavy" size={24} style={{ marginTop: 12 }}>Check-in sent</T>
          <T size={14} color={C.muted} style={{ marginTop: 6 }}>{shared ? `${sponsor} can see it now.` : "Kept private, just for you."}</T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label="Send check-in" onPress={() => { actions.checkIn({ mood, note: note.trim(), shared }); setSent(true); }} />}>
      <TopBar onBack={() => navigation.goBack()} title="How was your week?" sub="Ten seconds. It helps the people supporting you worry less." />
      <View style={{ flexDirection: "row", marginHorizontal: -4 }}>
        {MOODS.map(([k, emoji, label]) => (
          <Pressable key={k} onPress={() => setMood(k)} style={{ flex: 1 }}>
            <Card tone={mood === k ? "tint" : "default"} style={{ alignItems: "center", marginHorizontal: 4, borderWidth: mood === k ? 2 : 1, borderColor: mood === k ? C.indigo : C.line }}>
              <T size={34}>{emoji}</T>
              <T w="semi" size={12.5} style={{ marginTop: 4 }}>{label}</T>
            </Card>
          </Pressable>
        ))}
      </View>
      <Field label="Anything to add? (optional)" value={note} onChangeText={setNote} placeholder="e.g. Tests went well" multiline />
      <Card style={{ paddingVertical: 2 }}>
        <Toggle label={`Share with ${sponsor}`} sub="Only your mood and note. Never your spending." value={shared} onValueChange={setShared} />
      </Card>
      <Notice icon="eye-off">Wellsent can't see what you buy, and never shows it to anyone.</Notice>
    </Screen>
  );
}
