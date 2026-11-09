// "Got paid? Add it": new income joins the vault and every remaining payday
// gets bigger, instead of the money landing as one lump to spend.
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, TopBar, T, Card, Button, Chip, Field, ShieldResult, Notice } from "../../components/UI";
import { Asset, Float, Glow, haptic } from "../../components/Brand";
import { useStore, DEMO } from "../../state/store";
import { nextPayout } from "../../state/planMath";
import { checkSend } from "../../shield/shield";

const SOURCES = ["Client payment", "Upwork or Fiverr", "Salary", "Other"];

export default function TopUp({ navigation }) {
  const { state, actions } = useStore();
  const p = state.plan;
  const [amount, setAmount] = useState("500");
  const [source, setSource] = useState("Client payment");
  const [done, setDone] = useState(null);
  const n = Number(amount) || 0;
  const now = nextPayout(p);
  const after = p ? nextPayout({ allowanceLeft: p.allowanceLeft + n, payoutsLeft: p.payoutsLeft }) : 0;
  const contacts = [{ label: "Your Wellsent vault", address: DEMO.vault, network: "TRC20" }];
  const result = useMemo(() => checkSend({ address: DEMO.vault, network: "TRC20", amount: n, contacts }), [n]);
  if (!p) return null;

  if (done) {
    return (
      <Screen footer={<Button label="Back to home" onPress={() => navigation.goBack()} />}>
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <View style={{ width: 180, height: 160, alignItems: "center", justifyContent: "center" }}>
            <Glow size={180} color={C.gold} strength={0.08} />
            <Float amplitude={6}><Asset name="vault" size={140} /></Float>
          </View>
          <T w="heavy" size={24} style={{ marginTop: 10, textAlign: "center" }}>{usd(done.amount)} added to your vault</T>
          <T size={14.5} color={C.muted} style={{ marginTop: 8, textAlign: "center", lineHeight: 21 }}>
            Every payday is now <T w="heavy" color={C.ink}>{usd(done.after)}</T> (≈ {naira(toNaira(done.after))}) for your {p.payoutsLeft} paydays left.
          </T>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          label={`Add ${usd(n)} to my vault`}
          icon="add-circle"
          disabled={n <= 0 || result.level === "danger"}
          onPress={() => { actions.topUp({ amount: n, source }); haptic.success(); setDone({ amount: n, after }); }}
        />
      }
    >
      <TopBar onBack={() => navigation.goBack()} title="Got paid? Add it" sub="Send the USDT you were paid to your vault. It's spread across your remaining paydays, so a big payment lasts." />

      <Field label="Amount" prefix="$" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" hint={n ? `≈ ${naira(toNaira(n))}` : undefined} />
      <T w="semi" size={13} color={C.muted} style={{ marginBottom: 8 }}>Where is it from?</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {SOURCES.map((s) => <Chip key={s} label={s} selected={source === s} onPress={() => setSource(s)} />)}
      </View>

      <Card gradient="indigo" style={{ marginTop: 6 }}>
        <T w="semi" size={13} color="#C9CCF5">Your weekly payday</T>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <T w="heavy" size={26} color="#C9CCF5" style={{ textDecorationLine: n > 0 ? "line-through" : "none" }}>{usd(now)}</T>
          <Ionicons name="arrow-forward" size={20} color={C.gold} style={{ marginHorizontal: 10 }} />
          <T w="heavy" size={32} color="#fff">{usd(after)}</T>
        </View>
        <T size={12.5} color="#DADCFF" style={{ marginTop: 6 }}>for each of your {p.payoutsLeft} paydays left · ≈ {naira(toNaira(after))}</T>
      </Card>

      <ShieldResult result={result} />
      <Notice icon="information-circle">
        Works with USDT sent straight from a client, Upwork payout wallet or exchange. Money already in your Cleva USD balance can't be moved back out as USDT.
      </Notice>
    </Screen>
  );
}
