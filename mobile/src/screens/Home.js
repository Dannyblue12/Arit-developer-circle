import React, { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, Image } from "react-native";
import { C, naira } from "../theme/theme";
import { Card, SectionLabel, ProgressBar, Skeleton, Entrance, IconChip, InlineIcon } from "../components/UI";
import { getSuggestions, getGoals, getWatch, getFreshPrices, currentUser } from "../api/client";

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export default function Home({ navigation }) {
  const [startHere, setStartHere] = useState(null);
  const [goal, setGoal] = useState(null);
  const [alert, setAlert] = useState(null);
  const [fresh, setFresh] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSyncExternalStore(
    (cb) => currentUser.subscribe(cb),
    () => currentUser.value
  );

  const load = useCallback(async () => {
    const [sug, goals, watch, prices] = await Promise.all([
      getSuggestions(), getGoals(), getWatch(), getFreshPrices(),
    ]);
    setStartHere(sug.startHere);
    setGoal(goals.goals?.[0] || null);
    // The strip is for things that need attention — danger or warn only.
    setAlert(watch.alerts?.find((a) => a.severity === "danger" || a.severity === "warn") || null);
    setFresh(prices.finds || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ padding: 20, paddingTop: 28, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.royal} colors={[C.royal]} />}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={st.hi}>{timeOfDay()}, {user?.name || "friend"}</Text>
        <Image source={require("../../assets/logo-mark.png")} style={st.mark} />
      </View>
      <Text style={st.sub}>Here's how to keep more of your money today.</Text>

      {loading ? (
        <>
          <Skeleton height={150} radius={22} />
          <Skeleton height={16} width={140} style={{ marginTop: 20 }} />
          <Skeleton height={110} radius={22} style={{ marginTop: 10 }} />
          <Skeleton height={16} width={120} style={{ marginTop: 20 }} />
          <Skeleton height={64} radius={18} style={{ marginTop: 10 }} />
          <Skeleton height={64} radius={18} style={{ marginTop: 12 }} />
        </>
      ) : (
        <>
          {/* Today's smart move — the #1 ranked suggestion */}
          {startHere && (
            <Entrance>
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("Spending")}>
                <View style={st.move}>
                  <Text style={st.moveLab}>● TODAY'S SMART MOVE</Text>
                  <Text style={st.moveTitle}>{startHere.title}</Text>
                  <Text style={st.moveBody}>{startHere.detail}</Text>
                  <Text style={st.moveSave}>Keeps {naira(startHere.saving)} in your pocket this month →</Text>
                </View>
              </TouchableOpacity>
            </Entrance>
          )}

          {/* Goal progress */}
          {goal && (
            <Entrance delay={60}>
              <SectionLabel right={<Text style={st.more} onPress={() => navigation.navigate("Goals")}>All goals</Text>}>
                You're saving toward
              </SectionLabel>
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("Goals")}>
                <View style={st.goal}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <InlineIcon emoji={goal.emoji} size={14} color="#CFE0D5" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#CFE0D5", fontSize: 13 }}>{goal.title}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                    <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>{naira(goal.savedAmount)}</Text>
                    <Text style={{ color: "#CFE0D5", fontSize: 12 }}>
                      of {naira(goal.targetAmount)} · {Math.round((goal.savedAmount / goal.targetAmount) * 100)}%
                    </Text>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <ProgressBar value={goal.savedAmount / goal.targetAmount} track="rgba(255,255,255,.18)" fill={C.goldSoft} />
                  </View>
                </View>
              </TouchableOpacity>
            </Entrance>
          )}

          {/* Watch alert — only when something unresolved needs attention */}
          {alert && (
            <Entrance delay={120}>
              <SectionLabel live right={<Text style={st.more} onPress={() => navigation.navigate("Watch")}>Open</Text>}>
                Savi is watching your money
              </SectionLabel>
              <Card style={{ backgroundColor: C.liveSoft, borderColor: "#F0C4B4" }} onPress={() => navigation.navigate("Watch")}>
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <InlineIcon name="shield-half" size={15} color="#8A3A22" style={{ marginRight: 7, marginTop: 1 }} />
                  <Text style={{ flex: 1, fontWeight: "700", color: "#8A3A22", fontSize: 14 }}>{alert.title}</Text>
                </View>
                <Text style={{ color: "#9A5540", fontSize: 12.5, marginTop: 5, lineHeight: 18 }}>{alert.body}</Text>
              </Card>
            </Entrance>
          )}

          {/* Fresh finds */}
          <Entrance delay={180}>
            <SectionLabel live right={<Text style={st.more} onPress={() => navigation.navigate("Prices")}>See all</Text>}>
              Fresh near you
            </SectionLabel>
            {fresh.length === 0 && (
              <Card>
                <Text style={{ color: C.muted, fontSize: 12.5, textAlign: "center" }}>
                  No finds near you yet — be the first to share one and earn ₦50.
                </Text>
              </Card>
            )}
            {fresh.slice(0, 2).map((f) => (
              <Card key={f._id} onPress={() => navigation.navigate("Prices")}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconChip emoji={f.emoji} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: C.ink, fontSize: 14 }}>{f.itemLabel}</Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                      {f.vendor} · confirmed by {f.confirmations}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: "800", color: C.royal, fontSize: 16 }}>{naira(f.price)}</Text>
                </View>
              </Card>
            ))}
          </Entrance>
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  hi: { fontSize: 26, fontWeight: "800", color: C.ink },
  mark: { width: 27, height: 28, resizeMode: "contain" },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 16 },
  more: { color: C.royal, fontSize: 12, fontWeight: "700" },
  move: { backgroundColor: C.royal, borderRadius: 22, padding: 20 },
  moveLab: { color: C.goldSoft, fontSize: 10.5, letterSpacing: 1.5, fontWeight: "700" },
  moveTitle: { color: "#fff", fontSize: 21, fontWeight: "800", marginTop: 10 },
  moveBody: { color: "rgba(255,255,255,.88)", fontSize: 13, marginTop: 8, lineHeight: 19 },
  moveSave: { color: "#fff", fontWeight: "700", fontSize: 13.5, marginTop: 14 },
  goal: { backgroundColor: C.royalDeep, borderRadius: 22, padding: 20 },
});
