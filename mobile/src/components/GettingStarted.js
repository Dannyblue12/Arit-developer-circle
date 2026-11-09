import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/theme";
import { Card, T } from "./UI";
import { Asset, Float } from "./Brand";

// Until the plan is live, home is a checklist: people always see what's
// done and what happens next.
export default function GettingStarted({ title, sub, steps, children }) {
  return (
    <Card gradient="indigo" style={{ padding: 20, overflow: "hidden" }}>
      <Float amplitude={6} style={{ position: "absolute", right: -8, top: -4 }}><Asset name="vault" size={118} /></Float>
      <T w="bold" size={12} color={C.gold} style={{ letterSpacing: 1.2 }}>GETTING STARTED</T>
      <T w="heavy" size={21} color="#fff" style={{ marginTop: 8, marginRight: 96, letterSpacing: -0.3 }}>{title}</T>
      <T size={13} color="#DADCFF" style={{ marginTop: 4, marginRight: 96, lineHeight: 19 }}>{sub}</T>
      <View style={{ marginTop: 18, gap: 11 }}>
        {steps.map(([label, done], i) => {
          const next = !done && (i === 0 || steps[i - 1][1]);
          return (
            <View key={label} style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={done ? "checkmark-circle" : next ? "radio-button-on" : "ellipse-outline"}
                size={20}
                color={done ? C.gold : next ? "#fff" : "rgba(255,255,255,0.45)"}
                style={{ marginRight: 10 }}
              />
              <T w={done || next ? "semi" : "regular"} size={14} color={done || next ? "#fff" : "#AEB2E8"} style={{ flex: 1 }}>{label}</T>
              {next ? <T w="bold" size={11} color={C.gold}>NEXT</T> : null}
            </View>
          );
        })}
      </View>
      {children}
    </Card>
  );
}

