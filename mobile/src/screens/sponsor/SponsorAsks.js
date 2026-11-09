import React from "react";
import { C } from "../../theme/theme";
import { Screen, TopBar, Notice, SectionLabel } from "../../components/UI";
import { useStore } from "../../state/store";
import { AskRow } from "../student/StudentAsks";

export default function SponsorAsks({ navigation }) {
  const { state } = useStore();
  const kid = state.student.first;
  const pending = state.asks.filter((k) => k.status === "pending");
  const past = state.asks.filter((k) => k.status !== "pending");
  return (
    <Screen>
      <TopBar title="Asks" sub={`Every request from ${kid} comes here, from their verified account. Anything outside Wellsent isn't from them.`} />
      <SectionLabel>Waiting for you</SectionLabel>
      {pending.length ? (
        pending.map((k) => <AskRow key={k.id} ask={k} onPress={() => navigation.navigate("AskDetail", { id: k.id })} />)
      ) : (
        <Notice icon="checkmark-circle" tone="safe">Nothing waiting. {kid} has no open requests.</Notice>
      )}
      {past.length ? (
        <>
          <SectionLabel>Earlier</SectionLabel>
          {past.map((k) => <AskRow key={k.id} ask={k} />)}
        </>
      ) : null}
    </Screen>
  );
}
