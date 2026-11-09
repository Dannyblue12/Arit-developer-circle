import React from "react";
import { View } from "react-native";
import { C, usd } from "../../theme/theme";
import { Screen, TopBar, Card, T, Button, Pill, IconChip, Notice } from "../../components/UI";
import { useStore, fmtDay } from "../../state/store";

export const REASON_ICON = {
  Books: "book", Health: "medkit", Transport: "bus", Data: "wifi", Hostel: "bed", Food: "restaurant", Other: "ellipsis-horizontal",
};

export function AskRow({ ask, sponsor, onPress }) {
  const pill = {
    pending: <Pill text="Waiting" tone="gold" icon="time" />,
    approved: <Pill text="Landed in Cleva" tone="safe" icon="checkmark" />,
    declined: <Pill text="Declined" tone="muted" />,
  }[ask.status];
  return (
    <Card onPress={onPress} style={{ flexDirection: "row", alignItems: "center" }}>
      <IconChip icon={REASON_ICON[ask.reason] || "chatbubble"} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <T w="bold" size={15}>{usd(ask.amount)} · {ask.reason}</T>
        <T size={12.5} color={C.muted} numberOfLines={1}>{ask.note || "No note"}</T>
        <T size={11.5} color={C.faint} style={{ marginTop: 2 }}>{fmtDay(ask.at)}{sponsor ? ` · to ${sponsor}` : ""}</T>
      </View>
      {pill}
    </Card>
  );
}

export default function StudentAsks({ navigation }) {
  const { state } = useStore();
  const sponsor = state.sponsor.first;
  const active = state.plan?.status === "active";
  return (
    <Screen>
      <TopBar
        title="Asks"
        sub={`Need extra? Ask here. ${sponsor} only trusts money requests that come through Wellsent.`}
      />
      <Button label="New ask" icon="add-circle" onPress={() => navigation.navigate("AskNew")} disabled={!active} />
      <View style={{ height: 16 }} />
      {state.asks.length === 0 ? (
        <Notice icon="chatbubbles">No asks yet. When you need extra for books, health or transport, ask here with a reason.</Notice>
      ) : (
        state.asks.map((k) => <AskRow key={k.id} ask={k} sponsor={sponsor} />)
      )}
    </Screen>
  );
}
