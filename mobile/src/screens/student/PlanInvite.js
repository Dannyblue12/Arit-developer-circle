import React from "react";
import { View } from "react-native";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, TopBar, Card, T, Button, ListItem } from "../../components/UI";
import Promises from "../../components/Promises";
import { useStore } from "../../state/store";

export default function PlanInvite({ navigation }) {
  const { state, actions } = useStore();
  const p = state.plan;
  const sponsor = state.sponsor.first;
  if (!p) return null;

  const accept = () => {
    actions.acceptPlan();
    navigation.goBack();
  };

  return (
    <Screen
      footer={
        p.status === "invited" ? (
          <View>
            <Button label="Accept plan" icon="checkmark-circle" onPress={accept} />
            <Button label={`Ask ${sponsor} a question`} variant="ghost" onPress={() => navigation.navigate("AskNew")} />
          </View>
        ) : (
          <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} />
        )
      }
    >
      <TopBar onBack={() => navigation.goBack()} title={`${sponsor} sent you a plan`} sub="Read it through. Nothing starts until you accept." />

      <Card tone="indigo" style={{ padding: 20 }}>
        <T w="semi" size={13} color="#C9CCF5">Your payday</T>
        <T w="heavy" size={38} color="#fff" style={{ letterSpacing: -1 }}>{usd(p.perPayout)}</T>
        <T w="semi" size={14} color="#fff">
          every {p.everyWeeks === 1 ? "Monday" : "2 weeks"} for {p.weeks} weeks · ≈ {naira(toNaira(p.perPayout))}
        </T>
        <T size={12.5} color="#C9CCF5" style={{ marginTop: 10 }}>Straight into your Cleva account.</T>
      </Card>

      <Card style={{ paddingVertical: 4 }}>
        <ListItem icon="medkit" title={`${usd(p.emergencyPot)} emergency pot`} subtitle="Yours instantly when something happens. No approval needed." />
        {p.fees ? (
          <ListItem icon="school" title={`${usd(p.fees)} for school fees`} subtitle={`Paid only to ${p.feesSchool}'s official channel.`} />
        ) : null}
        <ListItem icon="people" title={`Backup approver: ${p.backup.name}`} subtitle={`In ${p.backup.city}. Can approve your asks if ${sponsor} is asleep.`} last />
      </Card>

      <Promises />
      <T size={12} color={C.muted} style={{ textAlign: "center", marginTop: 4 }}>
        Total in the vault: {usd(p.vaultTotal)} · held by the vault, not by Wellsent
      </T>
    </Screen>
  );
}
