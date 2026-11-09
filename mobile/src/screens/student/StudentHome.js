import React from "react";
import { View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira, shortAddr, initials } from "../../theme/theme";
import { Screen, Card, T, Pill, IconChip, ProgressBar, Button, ListItem, Entrance, SectionLabel, pressFx } from "../../components/UI";
import { useStore, fmtDay, canUseEmergency, canPullForward } from "../../state/store";
import { nextPayout } from "../../state/planMath";
import { Asset, Float } from "../../components/Brand";
import GettingStarted from "../../components/GettingStarted";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

function daysUntil(iso) {
  const d = Math.ceil((new Date(iso) - Date.now()) / (24 * 3600 * 1000));
  return d <= 0 ? "today" : d === 1 ? "in 1 day" : `in ${d} days`;
}

function Action({ icon, label, sub, onPress, disabled }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [{ flex: 1 }, pressFx({ pressed })]}>
      <Card style={{ alignItems: "center", paddingVertical: 14, marginHorizontal: 4, opacity: disabled ? 0.5 : 1 }}>
        <IconChip icon={icon} size={42} />
        <T w="bold" size={13} style={{ marginTop: 8 }}>{label}</T>
        <T size={11} color={C.muted} style={{ marginTop: 1, textAlign: "center" }}>{sub}</T>
      </Card>
    </Pressable>
  );
}

export default function StudentHome({ navigation }) {
  const { state, actions } = useStore();
  const p = state.plan;
  const sponsor = state.sponsor.first;
  const amount = nextPayout(p);
  const perDay = p ? toNaira(amount) / (7 * p.everyWeeks) : 0;

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
        <View style={{ flex: 1 }}>
          <T size={14} color={C.muted}>{greeting()},</T>
          <T w="heavy" size={26} style={{ letterSpacing: -0.4 }}>{state.student.first}</T>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" }}>
          <T w="heavy" size={15} color="#fff">{initials(state.student.name)}</T>
        </View>
      </View>

      {!p || p.status === "awaiting_funding" || p.status === "invited" ? (
        <Entrance>
          <GettingStarted
            title={p?.status === "invited" ? `${sponsor} sent you a plan` : `Waiting for ${sponsor}`}
            sub={
              p?.status === "invited"
                ? `${usd(p.total)} over ${p.weeks} weeks · ${usd(p.perPayout)} every ${p.everyWeeks === 1 ? "Monday" : "2 weeks"}. Review it and accept.`
                : "You'll review and accept the plan before anything starts."
            }
            steps={[
              ["Account created", true],
              ["Cleva payday address saved", !!state.cleva],
              [`${sponsor} joined`, state.paired],
              [`${sponsor} sets up and funds your plan`, p?.status === "invited"],
              ["You accept the plan", false],
              ["First payday lands on Monday", false],
            ]}
          >
            {p?.status === "invited" ? (
              <Button label="Review plan" variant="gold" icon="document-text" onPress={() => navigation.navigate("PlanInvite")} style={{ marginTop: 18 }} />
            ) : null}
          </GettingStarted>
        </Entrance>
      ) : (
        <>
          <Entrance>
            <Card gradient="indigo" style={{ padding: 20, overflow: "hidden" }}>
              <Float amplitude={7} rotate={6} style={{ position: "absolute", right: -6, top: -2 }}>
                <Asset name="coin" size={108} />
              </Float>
              <Pill text={p.status === "ended" ? "PLAN COMPLETE" : "NEXT PAYDAY"} tone="onDark" />
              {p.status === "ended" ? (
                <T w="heavy" size={26} color="#fff" style={{ marginTop: 12 }}>All {usd(p.total)} delivered 🎉</T>
              ) : (
                <>
                  <T w="heavy" size={44} color="#fff" style={{ marginTop: 10, letterSpacing: -1 }}>{usd(amount)}</T>
                  <T w="semi" size={14} color="#C9CCF5">≈ {naira(toNaira(amount))}</T>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14 }}>
                    <Ionicons name="calendar" size={15} color={C.gold} style={{ marginRight: 6 }} />
                    <T w="semi" size={13.5} color="#fff">{fmtDay(p.nextPaydayAt)} · {daysUntil(p.nextPaydayAt)}</T>
                  </View>
                </>
              )}
              <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.16)", marginVertical: 14 }} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconChip icon="wallet" tone="onDark" size={34} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <T w="bold" size={13.5} color="#fff">Lands in your Cleva account</T>
                  <T size={12} color="#C9CCF5">{state.cleva?.network} · {shortAddr(state.cleva?.address)}</T>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={C.gold} />
              </View>
            </Card>
          </Entrance>

          {state.lastPayday ? (
            <Entrance delay={60}>
              <Card onPress={() => navigation.navigate("PaydayLanded")} style={{ flexDirection: "row", alignItems: "center" }}>
                <IconChip icon="checkmark-done" tone="gold" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <T w="bold">Last payday landed</T>
                  <T size={12.5} color={C.muted}>{usd(state.lastPayday.amount)} · {fmtDay(state.lastPayday.at)}</T>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.faint} />
              </Card>
            </Entrance>
          ) : null}

          {p.status === "active" ? (
            <Entrance delay={100}>
              <Card tone="tint" style={{ flexDirection: "row", alignItems: "center" }}>
                <IconChip icon="speedometer" size={38} style={{ marginRight: 12, backgroundColor: "#fff" }} />
                <View style={{ flex: 1 }}>
                  <T w="heavy" size={15}>{naira(perDay)} a day</T>
                  <T size={12.5} color={C.muted}>keeps you on track until your next payday</T>
                </View>
              </Card>
            </Entrance>
          ) : null}

          <Entrance delay={140}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <T w="heavy" size={15} style={{ flex: 1 }}>Week {p.week} of {p.weeks}</T>
                <Pill text={`${p.paydaysDone}/${p.payouts} paydays`} />
              </View>
              <ProgressBar value={p.paydaysDone / p.payouts} />
              <View style={{ flexDirection: "row", marginTop: 14 }}>
                {[
                  [usd(p.allowanceLeft), "still to come"],
                  [usd(p.emergencyLeft), "emergency pot"],
                  [p.fees ? usd(p.fees) : "—", p.feesStatus === "paid" ? "fees paid ✓" : "for school fees"],
                ].map(([v, l]) => (
                  <View key={l} style={{ flex: 1 }}>
                    <T w="heavy" size={16}>{v}</T>
                    <T size={11.5} color={C.muted}>{l}</T>
                  </View>
                ))}
              </View>
            </Card>
          </Entrance>

          {p.status === "active" ? (
            <Entrance delay={180}>
              <SectionLabel>Need more?</SectionLabel>
              <View style={{ flexDirection: "row", marginHorizontal: -4 }}>
                <Action icon="chatbubble-ellipses" label="Ask" sub={`Request from ${sponsor}`} onPress={() => navigation.navigate("AskNew")} />
                <Action
                  icon="medkit"
                  label="Emergency"
                  sub={canUseEmergency(p) ? `${usd(p.emergencyLeft)} ready now` : "Used this month"}
                  onPress={() => navigation.navigate("Emergency")}
                  disabled={!canUseEmergency(p)}
                />
                <Action
                  icon="play-forward"
                  label="Pull forward"
                  sub={canPullForward(p) ? "Next week, now" : "Not available"}
                  onPress={() => navigation.navigate("PullForward")}
                  disabled={!canPullForward(p)}
                />
              </View>
            </Entrance>
          ) : null}

          <Card style={{ paddingVertical: 4, marginTop: 6 }}>
            {p.fees ? (
              <ListItem
                icon="school"
                title="School fees"
                subtitle={{ reserved: `${usd(p.fees)} reserved for ${p.feesSchool}`, invoice: `Waiting for ${sponsor} to confirm`, paid: `Paid to ${p.feesSchool} ✓` }[p.feesStatus]}
                onPress={() => navigation.navigate("Fees")}
              />
            ) : null}
            <ListItem icon="happy" title="Weekly check-in" subtitle={`10 seconds. Tell ${sponsor} how your week went.`} onPress={() => navigation.navigate("CheckIn")} last />
          </Card>

          {p.status === "active" ? (
            <Button
              small
              variant="ghost"
              icon="flash"
              label="Run Monday payday (demo)"
              style={{ marginTop: 10 }}
              onPress={() => { actions.runPayday(); navigation.navigate("PaydayLanded"); }}
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}
