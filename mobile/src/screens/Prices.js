import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  RefreshControl, StyleSheet,
} from "react-native";
import { C, naira } from "../theme/theme";
import { Card, SectionLabel, Cta, Pill } from "../components/UI";
import { getPrices, shareFind } from "../api/client";

export default function Prices() {
  const [finds, setFinds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [form, setForm] = useState({ itemLabel: "", price: "", vendor: "" });

  const load = useCallback(async () => {
    const data = await getPrices();
    setFinds(data.finds || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onShare = async () => {
    if (!form.itemLabel || !form.price || !form.vendor) return;
    await shareFind({
      item: form.itemLabel.toLowerCase().replace(/\W+/g, "_").slice(0, 30),
      itemLabel: form.itemLabel,
      price: Number(form.price),
      vendor: form.vendor,
      emoji: "🛒",
    });
    setShared(true);
    setSharing(false);
    setForm({ itemLabel: "", price: "", vendor: "" });
    load();
  };

  // group rice finds for the ranked demo view
  const rice = finds.filter((f) => f.item === "rice_paint");
  const others = finds.filter((f) => f.item !== "rice_paint");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={st.h1}>Community prices</Text>
      <Text style={st.sub}>Real prices your neighbours just paid — fresh, verified, close to you.</Text>

      {shared && (
        <Card style={{ backgroundColor: C.mint, borderColor: C.mint2 }}>
          <Text style={{ color: C.royal, fontWeight: "700", fontSize: 13.5 }}>
            ✓ Posted to your area — +₦50 pending as neighbours confirm.
          </Text>
        </Card>
      )}

      {!sharing ? (
        <Cta label="＋ Share a find & earn ₦50" onPress={() => { setSharing(true); setShared(false); }} />
      ) : (
        <Card>
          <Text style={{ fontWeight: "800", color: C.ink, fontSize: 15, marginBottom: 10 }}>Share a find</Text>
          <TextInput
            style={st.input} placeholder="What did you buy? e.g. Rice — 1 paint"
            placeholderTextColor={C.faint}
            value={form.itemLabel} onChangeText={(v) => setForm({ ...form, itemLabel: v })}
          />
          <TextInput
            style={st.input} placeholder="What did you pay? e.g. 2650"
            placeholderTextColor={C.faint} keyboardType="numeric"
            value={form.price} onChangeText={(v) => setForm({ ...form, price: v })}
          />
          <TextInput
            style={st.input} placeholder="Where? e.g. Ojuelegba · Mama Gold"
            placeholderTextColor={C.faint}
            value={form.vendor} onChangeText={(v) => setForm({ ...form, vendor: v })}
          />
          <Cta label="Post this find" onPress={onShare} />
          <Cta label="Cancel" ghost onPress={() => setSharing(false)} />
        </Card>
      )}

      {rice.length > 0 && (
        <>
          <SectionLabel live>Rice · 1 paint — cheapest near you</SectionLabel>
          {rice.map((f, i) => (
            <Card key={f._id} style={i === 0 ? { backgroundColor: C.mint, borderColor: C.mint2 } : null}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ width: 24, color: i === 0 ? C.royal : C.faint, fontWeight: "800" }}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: C.ink, fontSize: 14 }}>{f.vendor}</Text>
                  <Text style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>
                    {f.distanceM}m · ✓ confirmed by {f.confirmations}{f.stale ? " · stale" : ""}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800", color: i === 0 ? C.royal : C.ink, fontSize: 16 }}>{naira(f.price)}</Text>
                  {i === 0 && <Pill text="CHEAPEST" />}
                </View>
              </View>
            </Card>
          ))}
        </>
      )}

      {others.length > 0 && (
        <>
          <SectionLabel live>More fresh finds</SectionLabel>
          {others.map((f) => (
            <Card key={f._id}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>{f.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: C.ink, fontSize: 14 }}>{f.itemLabel}</Text>
                  <Text style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>
                    {f.vendor} · confirmed by {f.confirmations}
                  </Text>
                </View>
                <Text style={{ fontWeight: "800", color: C.royal, fontSize: 15 }}>{naira(f.price)}</Text>
              </View>
            </Card>
          ))}
        </>
      )}

      <Text style={st.note}>
        Every price is a real purchase a neighbour made, confirmed by others nearby. Old prices fade out.
      </Text>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: C.line, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: C.ink, marginBottom: 10, backgroundColor: C.paper,
  },
  note: { color: C.muted, fontSize: 11.5, textAlign: "center", marginTop: 14, lineHeight: 17 },
});
