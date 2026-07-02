import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { C, naira } from "../theme/theme";
import { Card } from "../components/UI";
import { getWatch, resolveAlert } from "../api/client";

const STYLES = {
  danger: { bg: C.liveSoft, border: "#F0C4B4", title: "#8A3A22", body: "#9A5540", icon: "⚠️" },
  warn: { bg: C.goldSoft, border: "#EAD9B6", title: "#6E5410", body: "#7A5410", icon: "🔔" },
  info: { bg: C.mint, border: C.mint2, title: C.royal, body: "#3E5A4B", icon: "💡" },
};

export default function Watch() {
  const [alerts, setAlerts] = useState([]);
  const [caught, setCaught] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getWatch();
    setAlerts(data.alerts || []);
    setCaught(data.caughtThisWeek || 0);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onResolve = async (alert, resolution) => {
    setAlerts((a) => a.filter((x) => x._id !== alert._id));
    await resolveAlert(alert._id, resolution);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={st.h1}>Savi watch</Text>
      <Text style={st.sub}>Guarding your money — from waste and from fraud.</Text>

      <View style={st.hero}>
        <Text style={{ fontSize: 26, marginRight: 14 }}>🛡️</Text>
        <View>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Watching every payment</Text>
          <Text style={{ color: "rgba(255,255,255,.85)", fontSize: 12, marginTop: 2 }}>
            {caught} things caught this week · 0 got past
          </Text>
        </View>
      </View>

      {alerts.map((a) => {
        const s = STYLES[a.severity];
        return (
          <Card key={a._id} style={{ backgroundColor: s.bg, borderColor: s.border }}>
            <Text style={{ fontWeight: "800", color: s.title, fontSize: 14 }}>
              {s.icon} {a.title}
            </Text>
            <Text style={{ color: s.body, fontSize: 12.5, marginTop: 5, lineHeight: 18 }}>{a.body}</Text>
            {a.severity === "danger" && (
              <View style={{ flexDirection: "row", marginTop: 12 }}>
                <TouchableOpacity
                  style={[st.btn, { backgroundColor: C.live }]}
                  onPress={() => onResolve(a, "cancelled")}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12.5 }}>Cancel — let me check</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[st.btn, { backgroundColor: "#fff", borderWidth: 1, borderColor: s.border, marginLeft: 8 }]}
                  onPress={() => onResolve(a, "trusted")}
                >
                  <Text style={{ color: s.title, fontWeight: "700", fontSize: 12.5 }}>It's fine, I know them</Text>
                </TouchableOpacity>
              </View>
            )}
            {a.severity !== "danger" && (
              <TouchableOpacity onPress={() => onResolve(a, "dismissed")} style={{ marginTop: 10 }}>
                <Text style={{ color: s.title, fontWeight: "700", fontSize: 12 }}>Dismiss</Text>
              </TouchableOpacity>
            )}
          </Card>
        );
      })}

      {alerts.length === 0 && (
        <Card>
          <Text style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>
            All clear. Savi is watching quietly. 🛡️
          </Text>
        </Card>
      )}

      <Text style={st.promise}>
        🔒 Savi only warns you — it never moves or blocks your money itself.
      </Text>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 14 },
  hero: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.royal,
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  btn: { flex: 1, borderRadius: 11, paddingVertical: 10, alignItems: "center" },
  promise: { color: C.royal, fontSize: 11.5, textAlign: "center", marginTop: 10, fontWeight: "600" },
});
