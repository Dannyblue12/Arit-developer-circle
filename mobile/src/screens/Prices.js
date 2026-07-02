import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TextInput,
  RefreshControl, StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
} from "react-native";
import { C, naira } from "../theme/theme";
import { Card, SectionLabel, Cta, Pill, Skeleton, Entrance } from "../components/UI";
import { getPrices, shareFind } from "../api/client";

export default function Prices() {
  const [finds, setFinds] = useState(null); // null = loading
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ itemLabel: "", price: "", vendor: "" });
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    const data = await getPrices();
    setFinds(data.finds || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const setField = (key) => (v) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (error) setError(null); // typing clears the hint
  };

  const onShare = async () => {
    if (!form.itemLabel.trim() || !form.price.trim() || !form.vendor.trim()) {
      setError("Please fill all three — what you bought, the price, and where.");
      return;
    }
    const price = Number(form.price.replace(/[,\s]/g, ""));
    if (!Number.isFinite(price) || price <= 0) {
      setError("The price should be a number, e.g. 2650.");
      return;
    }
    Keyboard.dismiss();
    await shareFind({
      item: form.itemLabel.toLowerCase().replace(/\W+/g, "_").slice(0, 30),
      itemLabel: form.itemLabel.trim(),
      price,
      vendor: form.vendor.trim(),
      emoji: "🛒",
    });
    setShared(true);
    setSharing(false);
    setError(null);
    setForm({ itemLabel: "", price: "", vendor: "" });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    load();
  };

  // group rice finds for the ranked demo view
  const rice = (finds || []).filter((f) => f.item === "rice_paint");
  const others = (finds || []).filter((f) => f.item !== "rice_paint");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: C.paper }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.royal} colors={[C.royal]} />}
      >
        <Text style={st.h1}>Community prices</Text>
        <Text style={st.sub}>Real prices your neighbours just paid — fresh, verified, close to you.</Text>

        {shared && (
          <Entrance duration={150}>
            <Card style={{ backgroundColor: C.mint, borderColor: C.mint2 }}>
              <Text style={{ color: C.royal, fontWeight: "700", fontSize: 13.5 }}>
                ✓ Posted to your area — +₦50 pending as neighbours confirm.
              </Text>
            </Card>
          </Entrance>
        )}

        {!sharing ? (
          <Cta label="＋ Share a find & earn ₦50" onPress={() => { setSharing(true); setShared(false); }} />
        ) : (
          <Card>
            <Text style={{ fontWeight: "800", color: C.ink, fontSize: 15, marginBottom: 10 }}>Share a find</Text>
            <TextInput
              style={st.input} placeholder="What did you buy? e.g. Rice — 1 paint"
              placeholderTextColor={C.faint}
              value={form.itemLabel} onChangeText={setField("itemLabel")}
            />
            <TextInput
              style={st.input} placeholder="What did you pay? e.g. 2650"
              placeholderTextColor={C.faint} keyboardType="numeric"
              value={form.price} onChangeText={setField("price")}
            />
            <TextInput
              style={st.input} placeholder="Where? e.g. Ojuelegba · Mama Gold"
              placeholderTextColor={C.faint}
              value={form.vendor} onChangeText={setField("vendor")}
            />
            {error && <Text style={st.errHint}>{error}</Text>}
            <Cta label="Post this find" onPress={onShare} />
            <Cta label="Cancel" ghost onPress={() => { setSharing(false); setError(null); }} />
          </Card>
        )}

        {finds === null ? (
          <>
            <Skeleton height={16} width={220} style={{ marginTop: 20 }} />
            <Skeleton height={64} radius={18} style={{ marginTop: 10 }} />
            <Skeleton height={64} radius={18} style={{ marginTop: 12 }} />
            <Skeleton height={64} radius={18} style={{ marginTop: 12 }} />
          </>
        ) : (
          <>
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
                          {f.distanceM}m · {f.confirmations > 0 ? `✓ confirmed by ${f.confirmations}` : "new · awaiting confirmations"}{f.stale ? " · older price" : ""}
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
                          {f.vendor} · {f.confirmations > 0 ? `confirmed by ${f.confirmations}` : "new · awaiting confirmations"}
                        </Text>
                      </View>
                      <Text style={{ fontWeight: "800", color: C.royal, fontSize: 15 }}>{naira(f.price)}</Text>
                    </View>
                  </Card>
                ))}
              </>
            )}

            {rice.length === 0 && others.length === 0 && (
              <Card style={{ marginTop: 18 }}>
                <Text style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>
                  No prices in your area yet — share the first find and earn ₦50. 🏷️
                </Text>
              </Card>
            )}
          </>
        )}

        <Text style={st.note}>
          Every price is a real purchase a neighbour made, confirmed by others nearby. Old prices fade out.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: C.line, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: C.ink, marginBottom: 10, backgroundColor: C.paper, minHeight: 44,
  },
  errHint: { color: C.live, fontSize: 12, fontWeight: "600", marginBottom: 4, marginTop: 2 },
  note: { color: C.muted, fontSize: 11.5, textAlign: "center", marginTop: 14, lineHeight: 17 },
});
