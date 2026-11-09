import React from "react";
import { View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../theme/theme";
import { Screen, T, Entrance, pressFx } from "../../components/UI";
import { LogoMark, Wordmark } from "../../components/Logo";

const POINTS = [
  ["calendar", "Weekly paydays straight into your Cleva account"],
  ["chatbubbles", "Money requests only from verified family"],
  ["shield-checkmark", "Shield checks every payment before it leaves"],
];

function RoleCard({ icon, title, sub, onPress, primary }) {
  return (
    <Pressable onPress={onPress} style={pressFx}>
      <View
        style={{
          flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 16, marginTop: 12,
          backgroundColor: primary ? C.indigo : "rgba(255,255,255,0.08)",
          borderWidth: 1, borderColor: primary ? C.indigo : "rgba(255,255,255,0.18)",
        }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
          <Ionicons name={icon} size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <T w="bold" size={16} color="#fff">{title}</T>
          <T size={12.5} color="#C9CCF5" style={{ marginTop: 2 }}>{sub}</T>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </View>
    </Pressable>
  );
}

export default function Welcome({ navigation }) {
  return (
    <Screen bg={C.ink}>
      <StatusBar style="light" />
      <Entrance style={{ alignItems: "center", marginTop: 36 }}>
        <LogoMark size={76} />
        <View style={{ marginTop: 18 }}><Wordmark size={38} color="#fff" /></View>
        <T w="semi" size={17} color="#fff" style={{ marginTop: 8 }}>Money well sent.</T>
        <T size={13.5} color="#9EA3D8" style={{ marginTop: 4 }}>Send am. Sleep well.</T>
      </Entrance>

      <Entrance delay={120} style={{ marginTop: 36 }}>
        {POINTS.map(([icon, text]) => (
          <View key={icon} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name={icon} size={18} color={C.gold} style={{ marginRight: 12 }} />
            <T size={14} color="#E4E6FB" style={{ flex: 1 }}>{text}</T>
          </View>
        ))}
      </Entrance>

      <Entrance delay={220} style={{ marginTop: 20 }}>
        <RoleCard
          primary
          icon="school"
          title="I'm a student"
          sub="Get paydays from family, safely"
          onPress={() => navigation.navigate("SignUp", { role: "student" })}
        />
        <RoleCard
          icon="heart"
          title="I support a student"
          sub="Send money that lasts the whole month"
          onPress={() => navigation.navigate("SignUp", { role: "sponsor" })}
        />
        <T size={11.5} color="#7E84C2" style={{ textAlign: "center", marginTop: 22 }}>
          Paydays arrive through Cleva · Built for the Cleva × Tether hackathon
        </T>
      </Entrance>
    </Screen>
  );
}
