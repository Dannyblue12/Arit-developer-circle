import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, initials } from "../../theme/theme";
import { Screen, Card, T, Pill, IconChip, ProgressBar, Button, SectionLabel, Entrance } from "../../components/UI";
import { useStore, fmtDay } from "../../state/store";
import { nextPayout } from "../../state/planMath";
import { AskRow } from "../student/StudentAsks";
import { ActivityRow } from "../student/Activity";
import { MOODS } from "../student/CheckIn";

export default function SponsorHome({ navigation }) {
  const { state } = useStore();
  const p = state.plan;
  const kid = state.student.first;
  const pending = state.asks.filter((k) => k.status === "pending");
  const checkin = state.checkins.find((c) => c.shared);
  const inVault = p ? p.allowanceLeft + p.emergencyLeft + (p.feesStatus === "paid" ? 0 : p.fees) : 0;

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
        <View style={{ flex: 1 }}>
          <T size={14} color={C.muted}>Hello,</T>
          <T w="heavy" size={26} style={{ letterSpacing: -0.4 }}>{state.sponsor.first}</T>
        </View>
        <Pill text={state.sponsor.city} tone="muted" icon="location" />
      </View>

      <Entrance>
        <Card tone="ink" onPress={() => navigation.navigate("ScamCheck")} style={{ flexDirection: "row", alignItems: "center", padding: 18 }}>
          <IconChip icon="shield-checkmark" tone="onDark" size={46} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <T w="heavy" size={16} color="#fff">Is this really {kid}?</T>
            <T size={12.5} color="#B9BDEB" style={{ marginTop: 2 }}>Got a call or WhatsApp asking for money? Check here first.</T>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </Card>
      </Entrance>

      <Entrance delay={80}>
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <T w="heavy" size={15} color="#fff">{initials(state.student.name)}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T w="heavy" size={16}>{state.student.name}</T>
              <T size={12.5} color={C.muted}>{state.student.school}</T>
            </View>
            {p?.status === "active" ? <Pill text="Plan active" tone="safe" icon="checkmark" /> : null}
          </View>

          {!p ? (
            <>
              <T size={13.5} color={C.muted} style={{ marginTop: 14 }}>No plan yet. Set one up in about a minute.</T>
              <Button label={`Create ${kid}'s plan`} icon="add-circle" onPress={() => navigation.navigate("CreatePlan")} />
            </>
          ) : p.status === "awaiting_funding" ? (
            <Button label="Fund the vault" icon="lock-closed" onPress={() => navigation.navigate("FundVault")} style={{ marginTop: 14 }} />
          ) : p.status === "invited" ? (
            <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time" size={18} color={C.indigo} style={{ marginRight: 8 }} />
              <T w="semi" size={13.5} style={{ flex: 1 }}>Vault funded. Waiting for {kid} to accept the plan.</T>
            </View>
          ) : (
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <T w="bold" size={13.5} style={{ flex: 1 }}>Week {p.week} of {p.weeks}</T>
                <T size={13} color={C.muted}>{p.paydaysDone}/{p.payouts} paydays sent</T>
              </View>
              <ProgressBar value={p.paydaysDone / p.payouts} />
              <View style={{ flexDirection: "row", marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <T size={11.5} color={C.muted}>Next payday</T>
                  <T w="heavy" size={16}>{p.status === "ended" ? "Done" : usd(nextPayout(p))}</T>
                  <T size={11.5} color={C.muted}>{p.status === "ended" ? "Plan complete" : fmtDay(p.nextPaydayAt)}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T size={11.5} color={C.muted}>Still in vault</T>
                  <T w="heavy" size={16}>{usd(inVault)}</T>
                  <T size={11.5} color={C.muted}>incl. {usd(p.emergencyLeft)} emergency</T>
                </View>
              </View>
              <Button small variant="ghost" label="Plan details" icon="list" onPress={() => navigation.navigate("PlanDetail")} style={{ marginTop: 14 }} />
            </View>
          )}
        </Card>
      </Entrance>

      {pending.length ? (
        <Entrance delay={140}>
          <SectionLabel right={<Pill text={`${pending.length} waiting`} tone="gold" />}>{kid} is asking</SectionLabel>
          {pending.map((k) => (
            <AskRow key={k.id} ask={k} onPress={() => navigation.navigate("AskDetail", { id: k.id })} />
          ))}
        </Entrance>
      ) : null}

      {checkin ? (
        <Entrance delay={180}>
          <SectionLabel>Latest check-in</SectionLabel>
          <Card style={{ flexDirection: "row", alignItems: "center" }}>
            <T size={30} style={{ marginRight: 12 }}>{MOODS.find((m) => m[0] === checkin.mood)?.[1]}</T>
            <View style={{ flex: 1 }}>
              <T w="bold">{MOODS.find((m) => m[0] === checkin.mood)?.[2]}</T>
              <T size={12.5} color={C.muted}>{checkin.note || "No note"} · {fmtDay(checkin.at)}</T>
            </View>
          </Card>
        </Entrance>
      ) : null}

      {state.activity.length ? (
        <Entrance delay={220}>
          <SectionLabel>Updates</SectionLabel>
          <Card style={{ paddingVertical: 2 }}>
            {state.activity.slice(0, 4).map((a, i, arr) => (
              <ActivityRow key={a.id} a={a} last={i === arr.length - 1} />
            ))}
          </Card>
        </Entrance>
      ) : null}
    </Screen>
  );
}
