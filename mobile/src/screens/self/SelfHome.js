// Home for people paying themselves: freelancers, remote workers, creators.
// Same vault and paydays as a family plan, with no sponsor and no asks.
import React from "react";
import { View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira, shortAddr, initials } from "../../theme/theme";
import { Screen, Card, T, Pill, IconChip, ProgressBar, Button, Entrance, SectionLabel, pressFx } from "../../components/UI";
import { Asset, Float } from "../../components/Brand";
import GettingStarted from "../../components/GettingStarted";
import { useStore, fmtDay, canUseEmergency, canPullForward } from "../../state/store";
import { nextPayout } from "../../state/planMath";

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

export default function SelfHome({ navigation }) {
  const { state, actions } = useStore();
  const me = state.self;
  const p = state.plan;
  const amount = nextPayout(p);
  const perDay = p ? toNaira(amount) / (7 * p.everyWeeks) : 0;
  const days = p ? Math.max(0, Math.ceil((new Date(p.nextPaydayAt) - Date.now()) / 86400000)) : 0;

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
        <View style={{ flex: 1 }}>
          <T size={14} color={C.muted}>Hello,</T>
          <T w="heavy" size={26} style={{ letterSpacing: -0.4 }}>{me.first}</T>
          <T size={12.5} color={C.muted}>{me.work}</T>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" }}>
          <T w="heavy" size={15} color="#fff">{initials(me.name)}</T>
        </View>
      </View>

      {!p || p.status === "awaiting_funding" ? (
        <Entrance>
          <GettingStarted
            title="Pay yourself a salary"
            sub="Lock a big payment once. Get a fixed payday every Monday, straight into Cleva."
            steps={[
              ["Account created", true],
              ["Cleva payday address saved", !!state.cleva],
              ["Create your salary plan", !!p],
              ["Fund your vault", false],
              ["First payday on Monday", false],
            ]}
          >
            <Button
              label={p ? "Fund my vault" : "Create my plan"}
              variant="gold"
              icon={p ? "lock-closed" : "add-circle"}
              onPress={() => navigation.navigate(p ? "FundVault" : "CreatePlan")}
              style={{ marginTop: 18 }}
            />
          </GettingStarted>
        </Entrance>
      ) : (
        <>
          <Entrance>
            <Card gradient="indigo" style={{ padding: 20, overflow: "hidden" }}>
              <Float amplitude={7} rotate={6} style={{ position: "absolute", right: -6, top: -2 }}>
                <Asset name="coin" size={108} />
              </Float>
              <Pill text={p.status === "ended" ? "PLAN COMPLETE" : "YOUR NEXT PAYDAY"} tone="onDark" />
              {p.status === "ended" ? (
                <T w="heavy" size={26} color="#fff" style={{ marginTop: 12 }}>All {usd(p.total)} paid out 🎉</T>
              ) : (
                <>
                  <T w="heavy" size={44} color="#fff" style={{ marginTop: 10, letterSpacing: -1 }}>{usd(amount)}</T>
                  <T w="semi" size={14} color="#C9CCF5">≈ {naira(toNaira(amount))}</T>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14 }}>
                    <Ionicons name="calendar" size={15} color={C.gold} style={{ marginRight: 6 }} />
                    <T w="semi" size={13.5} color="#fff">{fmtDay(p.nextPaydayAt)} · {days <= 1 ? "tomorrow" : `in ${days} days`}</T>
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

          <Entrance delay={60}>
            <Card gradient="gold" onPress={() => navigation.navigate("TopUp")} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
              <View style={{ flex: 1 }}>
                <T w="heavy" size={16} color={C.ink}>Got paid? Add it</T>
                <T size={12.5} color={C.goldInk} style={{ marginTop: 2 }}>New client money is spread over your paydays.</T>
              </View>
              <Asset name="coin" size={54} style={{ marginRight: 4 }} />
              <Ionicons name="chevron-forward" size={20} color={C.ink} />
            </Card>
          </Entrance>

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
                  [usd(p.total), "locked in total"],
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
              <SectionLabel>Need more this week?</SectionLabel>
              <View style={{ flexDirection: "row", marginHorizontal: -4 }}>
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
                <Action icon="add-circle" label="Add income" sub="Top up the vault" onPress={() => navigation.navigate("TopUp")} />
              </View>
            </Entrance>
          ) : null}

          {state.lastPayday ? (
            <Card onPress={() => navigation.navigate("PaydayLanded")} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <IconChip icon="checkmark-done" tone="gold" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <T w="bold">Last payday landed</T>
                <T size={12.5} color={C.muted}>{usd(state.lastPayday.amount)} · {fmtDay(state.lastPayday.at)}</T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.faint} />
            </Card>
          ) : null}

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
