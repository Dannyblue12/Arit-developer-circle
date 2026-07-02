import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { C, naira } from "../theme/theme";
import { Card, SectionLabel, ProgressBar, Cta, Skeleton, Entrance } from "../components/UI";
import { getGoals } from "../api/client";

export default function Goals() {
  const [goals, setGoals] = useState(null); // null = loading, [] = none yet
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getGoals();
    setGoals(data.goals || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const main = goals?.[0];
  const weekTotal = main?.contributions?.reduce((s, c) => s + c.amount, 0) || 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.royal} colors={[C.royal]} />}
    >
      <Text style={st.h1}>Your goals</Text>
      <Text style={st.sub}>Every naira Savi saves you moves a goal closer.</Text>

      {goals === null ? (
        <>
          <Skeleton height={150} radius={22} />
          <Skeleton height={16} width={210} style={{ marginTop: 20 }} />
          <Skeleton height={56} radius={18} style={{ marginTop: 10 }} />
          <Skeleton height={56} radius={18} style={{ marginTop: 12 }} />
          <Skeleton height={56} radius={18} style={{ marginTop: 12 }} />
        </>
      ) : (
        <>
          {main && (
            <>
              <Entrance>
                <View style={st.hero}>
                  <Text style={{ color: "#CFE0D5", fontSize: 13 }}>{main.emoji} {main.title}</Text>
                  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 4 }}>
                    {naira(main.targetAmount)} goal
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 12 }}>
                    <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>{naira(main.savedAmount)}</Text>
                    <Text style={{ color: "#CFE0D5", fontSize: 12 }}>
                      {Math.round((main.savedAmount / main.targetAmount) * 100)}% · on track
                    </Text>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <ProgressBar value={main.savedAmount / main.targetAmount} track="rgba(255,255,255,.18)" fill={C.goldSoft} />
                  </View>
                </View>
              </Entrance>

              {main.contributions?.length > 0 && (
                <SectionLabel>What moved you closer this week</SectionLabel>
              )}
              {main.contributions?.map((c, i) => (
                <Entrance key={i} delay={80 + i * 60}>
                  <Card>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 20, marginRight: 12 }}>{c.emoji}</Text>
                      <Text style={{ flex: 1, fontWeight: "600", color: C.ink, fontSize: 13.5 }}>{c.label}</Text>
                      <Text style={{ fontWeight: "800", color: C.gold }}>+{naira(c.amount)}</Text>
                    </View>
                  </Card>
                </Entrance>
              ))}

              {weekTotal > 0 && (
                <Entrance delay={280}>
                  <Cta label={`Lock ${naira(weekTotal)} into my OPay savings pocket`} onPress={() => {}} />
                </Entrance>
              )}
            </>
          )}

          {goals.length === 0 && (
            <Card>
              <Text style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>
                No goals yet. When Savi finds you a saving, it'll ask what you're chasing. 🎯
              </Text>
            </Card>
          )}

          {goals.length > 1 && (
            <>
              <SectionLabel>Other goals</SectionLabel>
              {goals.slice(1).map((g) => (
                <Card key={g._id}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontSize: 20, marginRight: 10 }}>{g.emoji}</Text>
                    <Text style={{ fontWeight: "700", color: C.ink, flex: 1 }}>{g.title}</Text>
                    <Text style={{ color: C.muted, fontSize: 12 }}>
                      {naira(g.savedAmount)} of {naira(g.targetAmount)}
                    </Text>
                  </View>
                  <ProgressBar value={g.savedAmount / g.targetAmount} height={6} />
                </Card>
              ))}
            </>
          )}

          <Card style={{ backgroundColor: C.goldSoft, borderColor: "#EAD9B6" }}>
            <Text style={{ fontWeight: "700", color: "#6E5410", fontSize: 13.5 }}>
              ⭐ Savi suggests: an emergency cushion
            </Text>
            <Text style={{ color: "#7A5410", fontSize: 12, marginTop: 4, lineHeight: 17 }}>
              You restock ~₦60k monthly. A ₦30k cushion would cover a slow week — want to start one?
            </Text>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 14 },
  hero: { backgroundColor: C.royal, borderRadius: 22, padding: 20 },
});
