import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/theme";
import { T } from "./UI";

export const STUDENT_STEPS = ["Account", "Cleva", "Invite"];
export const SPONSOR_STEPS = ["Account", "Who you support"];
export const SELF_STEPS = ["Account", "Cleva"];

// "Step 2 of 3" with named steps, so people always know how much is left.
export default function SetupSteps({ steps, current }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <T w="bold" size={12} color={C.indigo} style={{ letterSpacing: 1, marginBottom: 8 }}>
        STEP {current + 1} OF {steps.length}
      </T>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {steps.map((s, i) => {
          const done = i < current;
          const on = i === current;
          return (
            <View key={s} style={{ flex: 1 }}>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: done || on ? C.indigo : C.indigoTint }} />
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                {done ? <Ionicons name="checkmark-circle" size={13} color={C.indigo} style={{ marginRight: 4 }} /> : null}
                <T w={on ? "bold" : "medium"} size={11.5} color={done || on ? C.ink : C.faint}>{s}</T>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
