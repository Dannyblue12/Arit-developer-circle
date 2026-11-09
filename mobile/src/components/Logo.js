// The "landing tick": a tick whose end becomes a gold dot — money sent,
// landed safely. Built from views so it stays crisp at every size.
import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/theme";
import { T } from "./UI";

export function LogoMark({ size = 56, bg = C.indigo, fg = "#fff" }) {
  const dot = size * 0.17;
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg,
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Ionicons name="checkmark-sharp" size={size * 0.66} color={fg} style={{ marginTop: size * 0.04 }} />
      <View
        style={{
          position: "absolute", width: dot, height: dot, borderRadius: dot / 2, backgroundColor: C.gold,
          top: size * 0.17, right: size * 0.15,
        }}
      />
    </View>
  );
}

export function Wordmark({ size = 28, color = C.ink }) {
  return (
    <T w="heavy" size={size} color={color} style={{ letterSpacing: -0.6 }}>
      wellsent<T w="heavy" size={size} color={C.gold}>.</T>
    </T>
  );
}
