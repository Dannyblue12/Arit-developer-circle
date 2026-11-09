import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd } from "../../theme/theme";
import { Screen, TopBar, T, Button, Notice, Card } from "../../components/UI";
import { useStore, canPullForward } from "../../state/store";
import { previewPullForward } from "../../state/planMath";

export default function PullForward({ navigation }) {
  const { state, actions } = useStore();
  const p = state.plan;
  const pv = previewPullForward(p);
  const [done, setDone] = useState(false);
  const ok = canPullForward(p);

  return (
    <Screen
      footer={
        done ? (
          <Button label="Back to home" onPress={() => navigation.goBack()} />
        ) : (
          <Button label={pv ? `Get ${usd(pv.now)} now` : "Not available"} icon="play-forward" disabled={!ok} onPress={() => { actions.pullForward(); setDone(true); }} />
        )
      }
    >
      <TopBar onBack={() => navigation.goBack()} title="Pull next payday forward" sub="Your own money, early. Not a loan, no interest." />
      {pv ? (
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <T size={12.5} color={C.muted}>Now</T>
              <T w="heavy" size={26}>{usd(pv.now)}</T>
            </View>
            <Ionicons name="arrow-forward" size={20} color={C.faint} />
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <T size={12.5} color={C.muted}>Each of your next {pv.payoutsAfter} paydays</T>
              <T w="heavy" size={26}>{usd(pv.later)}</T>
            </View>
          </View>
          <T size={12.5} color={C.muted} style={{ marginTop: 12 }}>
            Your remaining paydays get a little smaller to make up for it. They never go below $10.
          </T>
        </Card>
      ) : (
        <Notice icon="information-circle">Pulling forward isn't possible right now. It would make your later paydays smaller than $10.</Notice>
      )}
      {done ? (
        <Notice icon="checkmark-circle" tone="safe">Done. {usd(pv?.now || 0)} is on its way to your Cleva account.</Notice>
      ) : (
        <Notice icon="calendar">Up to 2 times a month. Used this month: {p?.pullsThisMonth || 0} of 2.</Notice>
      )}
    </Screen>
  );
}
