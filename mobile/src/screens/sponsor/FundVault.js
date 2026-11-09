import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, shortAddr } from "../../theme/theme";
import { Screen, TopBar, T, Card, Button, Chip, ShieldResult, Notice, Pill } from "../../components/UI";
import { useStore, DEMO } from "../../state/store";
import { checkSend, NETWORKS } from "../../shield/shield";

// Decorative QR-style block, seeded from the address so it looks stable.
function PseudoQR({ seed, size = 132 }) {
  const n = 13;
  const cells = [];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const r = Math.floor(i / n), c = i % n;
    const finder = (r < 3 && c < 3) || (r < 3 && c > n - 4) || (r > n - 4 && c < 3);
    cells.push(finder || (h >>> 16) % 2 === 0);
  }
  const s = size / n;
  return (
    <View style={{ width: size, height: size, flexDirection: "row", flexWrap: "wrap", backgroundColor: "#fff" }}>
      {cells.map((on, i) => <View key={i} style={{ width: s, height: s, backgroundColor: on ? C.ink : "#fff" }} />)}
    </View>
  );
}

export default function FundVault({ navigation }) {
  const { state, actions } = useStore();
  const p = state.plan;
  const kid = state.student.first;
  const [network, setNetwork] = useState("TRC20");
  const [funded, setFunded] = useState(false);
  const vault = network === "TRC20" ? DEMO.vault : "0x5aE1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9";
  const contacts = [{ label: `${kid}'s Wellsent vault`, address: vault, network }];
  const result = useMemo(() => checkSend({ address: vault, network, amount: p?.vaultTotal, contacts }), [vault, network, p?.vaultTotal]);
  if (!p) return null;

  if (funded) {
    return (
      <Screen footer={<Button label="Done" onPress={() => navigation.goBack()} />}>
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <View style={{ width: 84, height: 84, borderRadius: 28, backgroundColor: C.indigo, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="lock-closed" size={38} color="#fff" />
          </View>
          <T w="heavy" size={24} style={{ marginTop: 18 }}>Vault funded</T>
          <T size={14} color={C.muted} style={{ marginTop: 6, textAlign: "center", lineHeight: 20 }}>
            {usd(p.vaultTotal)} is locked by the plan's rules. {kid} has been asked to review and accept. Nothing is released until they do.
          </T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label={`Pay ${usd(p.vaultTotal)} from my wallet`} icon="wallet" onPress={() => { actions.fundVault(); setFunded(true); }} disabled={result.level !== "safe"} />}>
      <TopBar onBack={() => navigation.goBack()} title={`Fund ${kid}'s vault`} sub="Send USDT from your own wallet. Only the plan's rules can release it." />

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {Object.values(NETWORKS).map((n) => (
          <Chip key={n.key} label={n.label} selected={network === n.key} onPress={() => setNetwork(n.key)} />
        ))}
      </View>

      <Card style={{ alignItems: "center", paddingVertical: 22 }}>
        <T w="heavy" size={30}>{usd(p.vaultTotal)} <T w="bold" size={15} color={C.muted}>USDT</T></T>
        <View style={{ marginTop: 14, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: C.line }}>
          <PseudoQR seed={vault} />
        </View>
        <T w="semi" size={13} color={C.muted} style={{ marginTop: 12 }}>{shortAddr(vault)}</T>
        <Pill text={`${kid}'s vault · ${NETWORKS[network].label}`} tone="indigo" icon="lock-closed" style={{ marginTop: 8 }} />
      </Card>

      <ShieldResult result={result} />

      <Card style={{ flexDirection: "row", alignItems: "center", opacity: 0.6 }}>
        <Ionicons name="card" size={22} color={C.indigo} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <T w="bold">Pay by card or bank</T>
          <T size={12.5} color={C.muted}>Through a licensed partner such as Cleva. Coming soon.</T>
        </View>
        <Pill text="Soon" tone="muted" />
      </Card>
      <Notice icon="information-circle">Demo: no real money moves. Live, this uses a self-custody wallet built with Tether's WDK.</Notice>
    </Screen>
  );
}
