import React from "react";
import { View } from "react-native";
import { C } from "../theme/theme";
import { Card, T, Button } from "./UI";
import { useStore } from "../state/store";

// Pitch helpers: one phone can play both people and fast-forward time.
export default function DemoControls() {
  const { state, actions } = useStore();
  const other = state.role === "student" ? "sponsor" : "student";
  return (
    <Card tone="tint" style={{ marginTop: 18 }}>
      <T w="heavy" size={14}>Demo controls</T>
      <T size={12.5} color={C.muted} style={{ marginTop: 2, marginBottom: 6 }}>
        For the pitch. Not part of the real app.
      </T>
      <Button
        small
        label={`Switch to ${other === "sponsor" ? state.sponsor.first + "'s" : state.student.first + "'s"} phone`}
        icon="swap-horizontal"
        onPress={() => actions.setRole(other)}
        style={{ marginTop: 8 }}
      />
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <Button small label="Run payday" variant="ghost" icon="flash" style={{ flex: 1, marginRight: 8 }} onPress={actions.runPayday} />
        <Button small label="Reset demo" variant="ghost" icon="refresh" style={{ flex: 1 }} onPress={() => actions.reset(state.role)} />
      </View>
      <Button small label="Start fresh (onboarding)" variant="ghost" icon="sparkles" style={{ marginTop: 8 }} onPress={() => actions.reset(null)} />
    </Card>
  );
}
