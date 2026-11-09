import React from "react";
import { View } from "react-native";
import { C } from "../theme/theme";
import { Card, T, Button } from "./UI";
import { useStore } from "../state/store";

// Pitch helpers: one phone can play every kind of user and fast-forward time.
export default function DemoControls() {
  const { state, actions } = useStore();
  const role = state.role;
  return (
    <Card tone="tint" style={{ marginTop: 18 }}>
      <T w="heavy" size={14}>Demo controls</T>
      <T size={12.5} color={C.muted} style={{ marginTop: 2, marginBottom: 6 }}>
        For the pitch. Not part of the real app.
      </T>
      {role === "student" || role === "sponsor" ? (
        <Button
          small
          label={`Switch to ${role === "student" ? state.sponsor.first + "'s" : state.student.first + "'s"} phone`}
          icon="swap-horizontal"
          onPress={() => actions.setRole(role === "student" ? "sponsor" : "student")}
          style={{ marginTop: 8 }}
        />
      ) : (
        <Button small label="Try the family demo" icon="people" onPress={() => actions.reset("student")} style={{ marginTop: 8 }} />
      )}
      {role !== "self" ? (
        <Button small label="Try the freelancer demo" variant="ghost" icon="briefcase" onPress={() => actions.reset("self")} style={{ marginTop: 8 }} />
      ) : null}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <Button small label="Run payday" variant="ghost" icon="flash" style={{ flex: 1, marginRight: 8 }} onPress={actions.runPayday} />
        <Button small label="Reset demo" variant="ghost" icon="refresh" style={{ flex: 1 }} onPress={() => actions.reset(role)} />
      </View>
      <Button small label="Start fresh (onboarding)" variant="ghost" icon="sparkles" style={{ marginTop: 8 }} onPress={() => actions.reset(null)} />
    </Card>
  );
}
