import React from "react";
import { View } from "react-native";
import { C, usd } from "../../theme/theme";
import { Screen, TopBar, T, Card, IconChip } from "../../components/UI";
import { useStore, fmtDay } from "../../state/store";

export const ACTIVITY_ICON = {
  payday: ["checkmark-done", "gold"],
  ask: ["chatbubble-ellipses", "indigo"],
  emergency: ["medkit", "gold"],
  pull: ["play-forward", "indigo"],
  funded: ["lock-closed", "indigo"],
  accepted: ["hand-left", "indigo"],
  fees: ["school", "indigo"],
};

export function ActivityRow({ a, last }) {
  const [icon, tone] = ACTIVITY_ICON[a.type] || ["ellipse", "indigo"];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
      <IconChip icon={icon} tone={tone} size={38} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <T w="semi" size={14} numberOfLines={1}>{a.title}</T>
        <T size={11.5} color={C.faint} style={{ marginTop: 2 }}>
          {fmtDay(a.at)}{a.tx ? ` · proof ${a.tx.slice(0, 4)}…${a.tx.slice(-4)}` : ""}
        </T>
      </View>
      {a.amount != null ? <T w="heavy" size={15}>{usd(a.amount)}</T> : null}
    </View>
  );
}

export default function Activity() {
  const { state } = useStore();
  return (
    <Screen>
      <TopBar title="Activity" sub="Every payday and payment, with proof anyone can check on the blockchain." />
      <Card style={{ paddingVertical: 2 }}>
        {state.activity.length === 0 ? (
          <T color={C.muted} style={{ paddingVertical: 16 }}>Nothing yet. Your first payday will show here.</T>
        ) : (
          state.activity.map((a, i) => <ActivityRow key={a.id} a={a} last={i === state.activity.length - 1} />)
        )}
      </Card>
    </Screen>
  );
}
