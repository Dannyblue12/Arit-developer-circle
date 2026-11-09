import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { C } from "../../theme/theme";
import { Screen, TopBar, T, Chip, Field, ShieldResult, Button, Notice } from "../../components/UI";
import { useStore, DEMO } from "../../state/store";
import { checkSend, NETWORKS } from "../../shield/shield";

// Try-it presets for the pitch: one tap shows each Shield rule.
const PRESETS = [
  { label: "Lookalike scam", address: DEMO.lookalike, network: "TRC20", amount: "50" },
  { label: "Wrong network", address: DEMO.ethAddress, network: "TRC20", amount: "50" },
  { label: "$8 to Cleva", address: DEMO.clevaAddress, network: "TRC20", amount: "8" },
  { label: "Reported address", address: DEMO.flagged, network: "TRC20", amount: "30" },
  { label: "My real Cleva", address: DEMO.clevaAddress, network: "TRC20", amount: "25" },
];

export default function ShieldCheck({ navigation, route }) {
  const changing = route.params?.mode === "change";
  const { state } = useStore();
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("TRC20");
  const [amount, setAmount] = useState("");
  const [requested, setRequested] = useState(false);

  const contacts = state.cleva ? [{ label: "My Cleva account", address: state.cleva.address, network: state.cleva.network }] : [];
  const toCleva = state.cleva && address.trim() === state.cleva.address;
  const result = useMemo(
    () => checkSend({ address, network, amount: amount === "" ? undefined : Number(amount), contacts, destination: toCleva ? "cleva" : undefined }),
    [address, network, amount, toCleva, state.cleva]
  );

  return (
    <Screen
      footer={
        changing ? (
          <Button
            label={requested ? "Change requested" : "Request address change"}
            icon="time"
            disabled={result.level !== "safe" || requested}
            onPress={() => setRequested(true)}
          />
        ) : result.level === "danger" ? (
          <View style={{ flexDirection: "row" }}>
            <Button label="Cancel" variant="ghost" style={{ flex: 1, marginRight: 8 }} onPress={() => navigation.goBack()} />
            <Button label="Report" variant="danger" icon="flag" style={{ flex: 1 }} onPress={() => navigation.goBack()} />
          </View>
        ) : result.level === "caution" ? (
          <Button label="I've confirmed it. Continue" variant="dark" onPress={() => navigation.goBack()} />
        ) : (
          <Button label="Done" onPress={() => navigation.goBack()} />
        )
      }
    >
      <TopBar
        onBack={() => navigation.goBack()}
        title={changing ? "Change payday address" : "Shield check"}
        sub={changing ? "Paste your new Cleva deposit address. Shield checks it first." : "Check any address before money leaves. Shield only warns; you stay in control."}
      />

      {!changing ? (
        <>
          <T w="bold" size={12} color={C.muted} style={{ marginBottom: 8, letterSpacing: 1 }}>TRY A SCENARIO</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
            {PRESETS.map((p) => (
              <Chip
                key={p.label}
                label={p.label}
                selected={address === p.address && network === p.network && amount === p.amount}
                onPress={() => { setAddress(p.address); setNetwork(p.network); setAmount(p.amount); }}
              />
            ))}
          </View>
        </>
      ) : null}

      <Field label="Address" value={address} onChangeText={setAddress} placeholder="T… or 0x…" autoCapitalize="none" autoCorrect={false} inputStyle={{ fontSize: 14 }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {Object.values(NETWORKS).map((n) => (
          <Chip key={n.key} label={n.label} selected={network === n.key} onPress={() => setNetwork(n.key)} />
        ))}
      </View>
      {!changing ? <Field label="Amount (USD)" prefix="$" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" /> : null}

      <ShieldResult result={result} style={{ marginTop: 4 }} />

      {changing ? (
        <Notice icon="time" tone={requested ? "safe" : "tint"}>
          {requested
            ? `Requested. ${state.sponsor.first} must confirm, then it takes effect in 48 hours. Paydays keep going to your current address until then.`
            : `For your safety, changing where paydays land needs ${state.sponsor.first}'s confirmation and a 48-hour wait. A stolen phone can't redirect your money.`}
        </Notice>
      ) : null}
    </Screen>
  );
}
