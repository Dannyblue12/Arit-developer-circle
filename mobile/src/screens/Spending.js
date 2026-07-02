import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { C, naira } from "../theme/theme";
import { Card, SectionLabel, Pill, Skeleton, Entrance } from "../components/UI";
import { getSummary, getSuggestions, getTidy, tagTransaction } from "../api/client";

const TAG_OPTIONS = ["stock", "personal", "loan", "food"];

// The month total counts up from 0 over ~600ms — makes the number land.
function CountUpAmount({ value, style }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = Date.now();
    const dur = 600;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <Text style={style}>{naira(display)}</Text>;
}

export default function Spending() {
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [unknowns, setUnknowns] = useState([]);
  const [tagged, setTagged] = useState({}); // txId -> category
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [s, sug, tidy] = await Promise.all([getSummary(), getSuggestions(), getTidy()]);
    setSummary(s);
    setSuggestions(sug.suggestions || []);
    setUnknowns(tidy.unknowns || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onTag = async (tx, category) => {
    setTagged((t) => ({ ...t, [tx._id]: category }));
    await tagTransaction(tx._id, category);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.royal} colors={[C.royal]} />}
    >
      <Text style={st.h1}>Where your money goes</Text>
      <Text style={st.sub}>Sorted automatically from who you paid. No typing needed.</Text>

      {!summary ? (
        <>
          <Skeleton height={128} radius={18} />
          <Skeleton height={16} width={200} style={{ marginTop: 20 }} />
          <Skeleton height={170} radius={18} style={{ marginTop: 10 }} />
          <Skeleton height={64} radius={18} style={{ marginTop: 12 }} />
          <Skeleton height={64} radius={18} style={{ marginTop: 12 }} />
        </>
      ) : (
        <>
          <Entrance>
            <Card>
              <Text style={st.k}>SPENT THIS MONTH</Text>
              <CountUpAmount value={summary.monthTotal} style={st.big} />
              <Text style={{ color: C.muted, fontSize: 12.5, marginTop: 6 }}>
                On this pace you'll reach <Text style={{ fontWeight: "700", color: C.ink }}>{naira(summary.projected)}</Text>
              </Text>
              <View style={{ marginTop: 10 }}>
                <Pill text={`${summary.sortedAuto} of ${summary.totalTx} sorted automatically`} />
              </View>
            </Card>
          </Entrance>

          {/* AI suggestions with evidence */}
          <SectionLabel>Savi suggests · backed by your numbers</SectionLabel>
          {suggestions.length === 0 && (
            <Card>
              <Text style={{ color: C.muted, fontSize: 12.5, textAlign: "center" }}>
                Nothing to optimise yet — Savi will speak up when your numbers justify it.
              </Text>
            </Card>
          )}
          {suggestions.map((s, i) => (
            <Entrance key={s.id} delay={i * 60}>
              <Card style={i === 0 ? { borderColor: C.royal, borderWidth: 1.5 } : null}>
                {i === 0 && <Pill text="START HERE · EASIEST WIN" bg={C.goldSoft} color={C.gold} />}
                <View style={{ flexDirection: "row", marginTop: i === 0 ? 10 : 0 }}>
                  <Text style={{ fontSize: 24, marginRight: 10 }}>{s.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "800", color: C.ink, fontSize: 15 }}>{s.title}</Text>
                    <Text style={{ color: C.muted, fontSize: 12.5, marginTop: 4, lineHeight: 18 }}>{s.detail}</Text>
                  </View>
                </View>
                <View style={st.evidence}>
                  <Text style={st.evT}>
                    You: {naira(s.evidence.yourMonthly)} · your bracket: {naira(s.evidence.bracketMedian)}
                    {s.evidence.overBy > 0 ? ` · ${s.evidence.overBy}% over` : " · under median ✓"}
                  </Text>
                </View>
                <Text style={{ color: C.royal, fontWeight: "800", marginTop: 10 }}>
                  Saves ~{naira(s.saving)}/month · effort: {s.effort}
                </Text>
              </Card>
            </Entrance>
          ))}

          {/* Categories */}
          <SectionLabel>Your categories</SectionLabel>
          {summary.categories.map((c) => (
            <Card key={c.category}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 22, marginRight: 12 }}>{c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: C.ink, fontSize: 14 }}>{c.label}</Text>
                  <Text style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>{c.txCount} payments</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800", color: C.ink }}>{naira(c.amount)}</Text>
                  {c.overByPct !== null && (
                    <Text style={{ fontSize: 11, marginTop: 2, color: c.overByPct > 0 ? C.live : C.royal }}>
                      {c.overByPct > 0 ? `▲ ${c.overByPct}% vs bracket` : "✓ healthy"}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          ))}

          {/* Tidy up — ask once, remember forever */}
          {unknowns.length > 0 && (
            <>
              <SectionLabel>Tidy up · {unknowns.length} Savi couldn't read alone</SectionLabel>
              {unknowns.map((tx) => (
                <Card key={tx._id}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", color: C.ink }}>Transfer to {tx.counterparty}</Text>
                    <Text style={{ fontWeight: "800", color: C.ink }}>{naira(tx.amount)}</Text>
                  </View>
                  {tagged[tx._id] ? (
                    <Entrance duration={150}>
                      <View style={st.gotIt}>
                        <Text style={{ color: C.royal, fontSize: 12.5, fontWeight: "700" }}>
                          ✓ Got it — {tx.counterparty} = {tagged[tx._id]} from now on.
                        </Text>
                      </View>
                    </Entrance>
                  ) : (
                    <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
                      {TAG_OPTIONS.map((opt) => (
                        <TouchableOpacity key={opt} style={st.tap} activeOpacity={0.7} onPress={() => onTag(tx, opt)}>
                          <Text style={{ fontWeight: "600", color: C.ink, fontSize: 12.5, textTransform: "capitalize" }}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 14 },
  k: { fontSize: 10, letterSpacing: 1.2, color: C.muted, fontWeight: "700" },
  big: { fontSize: 32, fontWeight: "800", color: C.ink, marginTop: 6 },
  evidence: { backgroundColor: C.mint, borderRadius: 10, padding: 9, marginTop: 10 },
  evT: { color: C.royal, fontSize: 11.5, fontWeight: "600" },
  gotIt: {
    backgroundColor: C.mint, borderRadius: 11, paddingVertical: 10,
    paddingHorizontal: 12, marginTop: 10,
  },
  tap: {
    borderWidth: 1, borderColor: C.line, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16, marginRight: 8, marginBottom: 6,
    backgroundColor: "#fff", minHeight: 44, justifyContent: "center",
  },
});
