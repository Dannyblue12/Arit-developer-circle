import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet,
  LayoutAnimation, Platform, UIManager, Animated,
} from "react-native";
import { C } from "../theme/theme";
import { Card, Skeleton, IconChip, InlineIcon } from "../components/UI";
import { getWatch, resolveAlert } from "../api/client";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STYLES = {
  danger: { bg: C.liveSoft, border: "#F0C4B4", title: "#8A3A22", body: "#9A5540", icon: "warning" },
  warn: { bg: C.goldSoft, border: "#EAD9B6", title: "#6E5410", body: "#7A5410", icon: "notifications" },
  info: { bg: C.mint, border: C.mint2, title: C.royal, body: "#3E5A4B", icon: "bulb" },
};

// Danger cards pulse their border once on mount — a single beat to draw the
// eye, never a loop.
function DangerPulse({ children }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 350, useNativeDriver: false }),
      Animated.timing(pulse, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start();
  }, [pulse]);
  const borderColor = pulse.interpolate({ inputRange: [0, 1], outputRange: ["#F0C4B4", C.live] });
  return (
    <Animated.View style={[st.pulseWrap, { borderColor }]}>
      {children}
    </Animated.View>
  );
}

export default function Watch() {
  const [alerts, setAlerts] = useState(null); // null = loading
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
    // Height collapse + fade (~200ms) instead of vanishing.
    LayoutAnimation.configureNext(LayoutAnimation.create(200, "easeInEaseOut", "opacity"));
    setAlerts((a) => a.filter((x) => x._id !== alert._id));
    await resolveAlert(alert._id, resolution);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ padding: 20, paddingTop: 28, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.royal} colors={[C.royal]} />}
    >
      <Text style={st.h1}>Savi watch</Text>
      <Text style={st.sub}>Guarding your money — from waste and from fraud.</Text>

      {alerts === null ? (
        <>
          <Skeleton height={72} radius={18} />
          <Skeleton height={130} radius={18} style={{ marginTop: 12 }} />
          <Skeleton height={100} radius={18} style={{ marginTop: 12 }} />
          <Skeleton height={100} radius={18} style={{ marginTop: 12 }} />
        </>
      ) : (
        <>
          <View style={st.hero}>
            <IconChip icon="shield-checkmark" color="#fff" size={44} bg="rgba(255,255,255,.14)" style={{ marginRight: 14 }} />
            <View>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Watching every payment</Text>
              <Text style={{ color: "rgba(255,255,255,.85)", fontSize: 12, marginTop: 2 }}>
                {caught} things caught this week · 0 got past
              </Text>
            </View>
          </View>

          {alerts.map((a) => {
            const s = STYLES[a.severity];
            const card = (
              <Card
                key={a._id}
                style={[
                  { backgroundColor: s.bg, borderColor: s.border },
                  a.severity === "danger" && { borderWidth: 0, marginBottom: 0 },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <InlineIcon name={s.icon} size={15} color={s.title} style={{ marginRight: 7, marginTop: 1 }} />
                  <Text style={{ flex: 1, fontWeight: "800", color: s.title, fontSize: 14 }}>{a.title}</Text>
                </View>
                <Text style={{ color: s.body, fontSize: 12.5, marginTop: 5, lineHeight: 18 }}>{a.body}</Text>
                {a.severity === "danger" ? (
                  <View style={{ flexDirection: "row", marginTop: 12 }}>
                    <TouchableOpacity
                      style={[st.btn, { backgroundColor: C.live }]}
                      activeOpacity={0.8}
                      onPress={() => onResolve(a, "cancelled")}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12.5 }}>Cancel — let me check</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[st.btn, { backgroundColor: "#fff", borderWidth: 1, borderColor: s.border, marginLeft: 8 }]}
                      activeOpacity={0.8}
                      onPress={() => onResolve(a, "trusted")}
                    >
                      <Text style={{ color: s.title, fontWeight: "700", fontSize: 12.5 }}>It's fine, I know them</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => onResolve(a, "dismissed")}
                    style={{ marginTop: 10, alignSelf: "flex-start" }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text style={{ color: s.title, fontWeight: "700", fontSize: 12 }}>Dismiss</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
            return a.severity === "danger" ? <DangerPulse key={a._id}>{card}</DangerPulse> : card;
          })}

          {alerts.length === 0 && (
            <Card style={{ alignItems: "center", paddingVertical: 24 }}>
              <IconChip icon="shield-checkmark" size={44} style={{ marginBottom: 10 }} />
              <Text style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>
                All clear. Savi is watching quietly.
              </Text>
            </Card>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
            <InlineIcon name="lock-closed" size={12} color={C.royal} style={{ marginRight: 5 }} />
            <Text style={st.promise}>
              Savi only warns you — it never moves or blocks your money itself.
            </Text>
          </View>
        </>
      )}
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
  pulseWrap: { borderWidth: 1.5, borderRadius: 19, marginBottom: 12 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", minHeight: 44, justifyContent: "center" },
  promise: { color: C.royal, fontSize: 11.5, textAlign: "center", fontWeight: "600" },
});
