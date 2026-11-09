import React from "react";
import { View } from "react-native";
import { C, initials } from "../../theme/theme";
import { Screen, TopBar, T, Card, ListItem, SectionLabel } from "../../components/UI";
import DemoControls from "../../components/DemoControls";
import { useStore } from "../../state/store";

export default function SponsorMe({ navigation }) {
  const { state } = useStore();
  const s = state.sponsor;
  return (
    <Screen>
      <TopBar title="Me" />
      <Card style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: C.ink, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <T w="heavy" size={17} color="#fff">{initials(s.name)}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T w="heavy" size={16}>{s.name}</T>
          <T size={12.5} color={C.muted}>“{s.first}” to {state.student.first} · {s.city}</T>
          <T size={12.5} color={C.muted}>{s.phone}</T>
        </View>
      </Card>

      <SectionLabel>Your students</SectionLabel>
      <Card style={{ paddingVertical: 2 }}>
        <ListItem icon="school" title={state.student.name} subtitle={state.student.school} onPress={() => navigation.navigate("PlanDetail")} last />
      </Card>

      <SectionLabel>Wallet & safety</SectionLabel>
      <Card style={{ paddingVertical: 2 }}>
        <ListItem icon="wallet" title="Your wallet" subtitle="Self-custody: only you hold the keys" />
        <ListItem icon="people" title={state.plan?.backup?.name || "Backup approver"} subtitle={`Backup approver · ${state.plan?.backup?.city || "not set"}`} />
        <ListItem icon="shield-checkmark" title="Shield check" subtitle="Check any address before you send" onPress={() => navigation.navigate("ShieldCheck")} last />
      </Card>

      <DemoControls />
    </Screen>
  );
}
