import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { C, naira } from "../theme/theme";
import { Card, SectionLabel, ProgressBar, Cta } from "../components/UI";
import { getGoals } from "../api/client";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getGoals();
    setGoals(data.goals || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const main = goals[0];
  const weekTotal = main?.contributions?.reduce((s, c) => s + c.amount, 0) || 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={st.h1}>Your goals</Text>
      <Text style={st.sub}>Every naira Savi saves you moves a goal closer.</Text>

      {main && (
        <>
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

          <SectionLabel>What moved you closer this week</SectionLabel>
          {main.contributions?.map((c, i) => (
            <Card key={i}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>{c.emoji}</Text>
                <Text style={{ flex: 1, fontWeight: "600", color: C.ink, fontSize: 13.5 }}>{c.label}</Text>
                <Text style={{ fontWeight: "800", color: C.royal }}>+{naira(c.amount)}</Text>
              </View>
            </Card>
          ))}

          {weekTotal > 0 && (
            <Cta label={`Lock ${naira(weekTotal)} into my OPay savings pocket`} onPress={() => {}} />
          )}
        </>
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
    </ScrollView>
  );
}

const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 14 },
  hero: { backgroundColor: C.royal, borderRadius: 22, padding: 20 },
});
