import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd } from "../../theme/theme";
import { Screen, TopBar, T, Card, Button, Notice, Pill } from "../../components/UI";
import { useStore, fmtDay } from "../../state/store";
import { nextPayout } from "../../state/planMath";

export default function PlanDetail({ navigation }) {
  const { state } = useStore();
  const p = state.plan;
  const kid = state.student.first;
  const [showStop, setShowStop] = useState(false);
  if (!p) return null;

  const upcoming = nextPayout(p);
  const rows = [];
  const paydays = state.activity.filter((a) => a.type === "payday").slice().reverse();
  for (let i = 0; i < p.payouts; i++) {
    const done = i < p.paydaysDone;
    const at = done ? paydays[i]?.at : new Date(new Date(p.nextPaydayAt).getTime() + (i - p.paydaysDone) * 7 * p.everyWeeks * 24 * 3600 * 1000).toISOString();
    rows.push({ i, done, at, amount: done ? paydays[i]?.amount : upcoming });
  }

  return (
    <Screen>
      <TopBar onBack={() => navigation.goBack()} title={`${kid}'s plan`} sub={`${usd(p.total)} over ${p.weeks} weeks · ${usd(p.emergencyPot)} emergency pot${p.fees ? ` · ${usd(p.fees)} fees` : ""}`} />

      <Card style={{ paddingVertical: 6 }}>
        {rows.map((r) => (
          <View key={r.i} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: r.i === rows.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
            <Ionicons name={r.done ? "checkmark-circle" : "ellipse-outline"} size={20} color={r.done ? C.gold : C.faint} style={{ marginRight: 10 }} />
            <T w={r.done ? "semi" : "regular"} style={{ flex: 1 }} color={r.done ? C.ink : C.muted}>
              Payday {r.i + 1} · {r.at ? fmtDay(r.at) : ""}
            </T>
            <T w="bold" color={r.done ? C.ink : C.muted}>{usd(r.amount || 0)}</T>
            {r.i === p.paydaysDone && p.status === "active" ? <Pill text="Next" style={{ marginLeft: 8 }} /> : null}
          </View>
        ))}
      </Card>

      <Button label="Top up the vault" icon="add-circle" variant="ghost" onPress={() => navigation.navigate("FundVault")} />
      <Button label="Pause or stop the plan" icon="pause-circle" variant="ghost" onPress={() => setShowStop(!showStop)} />
      {showStop ? (
        <Notice icon="time" tone="caution">
          {kid} is protected by 2 weeks' notice: the next 2 paydays still go out. After that, unreleased money returns to your wallet. Money already paid stays with {kid}.
        </Notice>
      ) : null}
      <Notice icon="information-circle">Increases happen straight away. Reductions need the same 2 weeks' notice.</Notice>
    </Screen>
  );
}
