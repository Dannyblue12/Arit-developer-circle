import React from "react";
import { View } from "react-native";
import { C } from "../theme/theme";
import { Card, T, IconChip } from "./UI";

// The 5 Student Promises. Written into the vault rules, shown wherever a
// plan is created or accepted.
export const PROMISES = [
  ["hand-left", "Agreed, not imposed", "Nothing starts until the student accepts the plan."],
  ["lock-open", "Released money is yours", "No spending controls, ever. Paid money can't be taken back."],
  ["time", "No sudden cut-offs", "Reducing or stopping a plan needs 2 weeks' notice."],
  ["checkmark-done", "Nothing left stranded", "Everything unlocks by the end date. Leftovers go to the student."],
  ["eye-off", "Privacy", "Sponsors see only what the student chooses to share."],
];

export default function Promises({ title = "Your 5 promises" }) {
  return (
    <Card>
      <T w="heavy" size={15} style={{ marginBottom: 4 }}>{title}</T>
      <T size={12.5} color={C.muted} style={{ marginBottom: 6 }}>Built into the vault's rules, not just this app.</T>
      {PROMISES.map(([icon, head, body]) => (
        <View key={head} style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 10 }}>
          <IconChip icon={icon} size={32} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <T w="bold" size={13.5}>{head}</T>
            <T size={12.5} color={C.muted} style={{ marginTop: 1 }}>{body}</T>
          </View>
        </View>
      ))}
    </Card>
  );
}
