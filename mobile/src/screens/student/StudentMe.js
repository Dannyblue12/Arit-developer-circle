import React from "react";
import { View } from "react-native";
import { C, shortAddr, initials } from "../../theme/theme";
import { Screen, TopBar, T, Card, ListItem, Pill, SectionLabel } from "../../components/UI";
import DemoControls from "../../components/DemoControls";
import { useStore } from "../../state/store";

export default function StudentMe({ navigation }) {
  const { state } = useStore();
  const s = state.student;
  return (
    <Screen>
      <TopBar title="Me" />
      <Card style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <T w="heavy" size={17} color="#fff">{initials(s.name)}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T w="heavy" size={16}>{s.name}</T>
          <T size={12.5} color={C.muted}>{s.school}</T>
          <T size={12.5} color={C.muted}>{s.phone}</T>
        </View>
      </Card>

      <SectionLabel>Where paydays land</SectionLabel>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <T w="heavy" size={15} style={{ flex: 1 }}>Cleva USD account</T>
          <Pill text="Verified" tone="safe" icon="checkmark" />
        </View>
        <T size={13} color={C.muted} style={{ marginTop: 4 }}>
          {state.cleva ? `${state.cleva.network} · ${shortAddr(state.cleva.address)}` : "Not connected"}
        </T>
        <T w="bold" size={13} color={C.indigo} style={{ marginTop: 10 }} onPress={() => navigation.navigate("ShieldCheck", { mode: "change" })}>
          Change address (48-hour safety wait)
        </T>
      </Card>

      <SectionLabel>People</SectionLabel>
      <Card style={{ paddingVertical: 2 }}>
        <ListItem icon="heart" title={state.sponsor.first} subtitle={`Supports you · ${state.sponsor.city}`} />
        <ListItem icon="people" title={state.plan?.backup?.name || "Backup approver"} subtitle={`Backup approver · ${state.plan?.backup?.city || "not set"}`} last />
      </Card>

      <SectionLabel>Safety</SectionLabel>
      <Card style={{ paddingVertical: 2 }}>
        <ListItem icon="shield-checkmark" title="Shield check" subtitle="Check any address before you send" onPress={() => navigation.navigate("ShieldCheck")} last />
      </Card>

      <DemoControls />
    </Screen>
  );
}
