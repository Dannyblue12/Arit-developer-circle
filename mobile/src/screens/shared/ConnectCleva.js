import React, { useMemo, useState } from "react";
import { View, Linking } from "react-native";
import { C } from "../../theme/theme";
import { Screen, TopBar, Card, T, Button, Chip, Field, ShieldResult, IconChip, Notice } from "../../components/UI";
import { useStore, DEMO } from "../../state/store";
import { checkSend, NETWORKS } from "../../shield/shield";

const STEPS = [
  ["person-add", "Open Cleva and sign up with code UNIUYO", "Use the same phone number."],
  ["id-card", "Verify your identity in Cleva", "BVN and a government ID. Takes a few minutes."],
  ["copy", "Copy your USDT deposit address", "In Cleva: Add funds → From stablecoins → USDT (TRC20)."],
];

export default function ConnectCleva({ navigation }) {
  const { actions } = useStore();
  const [network, setNetwork] = useState("TRC20");
  const [address, setAddress] = useState("");

  const result = useMemo(() => checkSend({ address, network }), [address, network]);
  const ok = result.level === "safe";

  const save = () => {
    actions.connectCleva({ address: address.trim(), network });
    navigation.navigate("Pair", { role: "student" });
  };

  return (
    <Screen footer={<Button label="Save my payday address" onPress={save} disabled={!ok} icon="checkmark-circle" />}>
      <TopBar
        onBack={() => navigation.goBack()}
        title="Connect your Cleva account"
        sub="Your paydays land here. Cleva turns them into dollars you can keep, spend with a card, or change to naira."
      />

      {STEPS.map(([icon, title, sub], i) => (
        <Card key={icon} style={{ flexDirection: "row", alignItems: "center" }}>
          <IconChip icon={icon} size={40} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <T w="bold" size={14}>{i + 1}. {title}</T>
            <T size={12.5} color={C.muted} style={{ marginTop: 2 }}>{sub}</T>
          </View>
        </Card>
      ))}
      <Button label="Open Cleva" variant="ghost" icon="open-outline" onPress={() => Linking.openURL("https://www.getcleva.com")} />

      <T w="bold" size={15} style={{ marginTop: 24, marginBottom: 10 }}>Paste your Cleva deposit address</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {Object.values(NETWORKS).map((n) => (
          <Chip key={n.key} label={n.label} selected={network === n.key} onPress={() => setNetwork(n.key)} />
        ))}
      </View>
      <Field
        value={address}
        onChangeText={setAddress}
        placeholder="T… or 0x…"
        autoCapitalize="none"
        autoCorrect={false}
        inputStyle={{ fontSize: 14 }}
        hint="Pick the same network you chose in Cleva."
      />
      <T w="bold" size={13} color={C.indigo} onPress={() => { setAddress(DEMO.clevaAddress); setNetwork("TRC20"); }} style={{ marginBottom: 12 }}>
        Use demo address
      </T>
      <ShieldResult result={result} />
      <Notice icon="shield-checkmark">
        Cleva's rules, enforced for you: we never send less than $10 (smaller deposits are lost) and always use the network you saved.
      </Notice>
    </Screen>
  );
}
