import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { C, usd, naira, toNaira } from "../../theme/theme";
import { Screen, TopBar, T, Card, Button, Chip, Field, Stepper, Toggle, Notice, ListItem } from "../../components/UI";
import Promises from "../../components/Promises";
import { useStore } from "../../state/store";
import { computePlan, MAX_WEEKS } from "../../state/planMath";

const STEPS = ["Amount", "Pots & rules", "Backup", "Review"];

function Steps({ step }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 18 }}>
      {STEPS.map((s, i) => (
        <View key={s} style={{ flex: 1, marginRight: i < STEPS.length - 1 ? 6 : 0 }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? C.indigo : C.indigoTint }} />
          <T w={i === step ? "bold" : "medium"} size={11} color={i <= step ? C.indigo : C.faint} style={{ marginTop: 6 }}>{s}</T>
        </View>
      ))}
    </View>
  );
}

export default function CreatePlan({ navigation }) {
  const { state, actions } = useStore();
  const kid = state.student.first;
  const [step, setStep] = useState(0);
  const [total, setTotal] = useState("300");
  const [weeks, setWeeks] = useState(12);
  const [emergencyPct, setEmergencyPct] = useState(15);
  const [feesOn, setFeesOn] = useState(true);
  const [fees, setFees] = useState("100");
  const [feesUnused, setFeesUnused] = useState("sponsor");
  const [allowPullForward, setAllowPullForward] = useState(true);
  const [backupName, setBackupName] = useState("Uncle Ekene");
  const [backupCity, setBackupCity] = useState("Lagos");

  const plan = useMemo(
    () => computePlan({ total: Number(total), weeks, emergencyPct, fees: feesOn ? Number(fees) || 0 : 0 }),
    [total, weeks, emergencyPct, fees, feesOn]
  );
  const cadence = plan.everyWeeks === 1 ? "every Monday" : "every 2 weeks";

  const finish = () => {
    actions.createPlan({
      total: Number(total), weeks, emergencyPct, fees: feesOn ? Number(fees) || 0 : 0,
      feesUnused, allowPullForward, backup: { name: backupName, city: backupCity },
    });
    navigation.replace("FundVault");
  };

  const footer =
    step < 3 ? (
      <Button label="Continue" onPress={() => setStep(step + 1)} disabled={step === 0 && !plan.ok} />
    ) : (
      <Button label={`Create plan & fund ${usd(plan.vaultTotal)}`} icon="lock-closed" onPress={finish} disabled={!plan.ok} />
    );

  return (
    <Screen footer={footer}>
      <TopBar onBack={() => (step ? setStep(step - 1) : navigation.goBack())} title={`${kid}'s plan`} />
      <Steps step={step} />

      {step === 0 ? (
        <>
          <Field label={`How much for ${kid}'s upkeep?`} prefix="$" value={total} onChangeText={setTotal} keyboardType="decimal-pad" hint="Includes the emergency pot. School fees come next." />
          <T w="semi" size={13} color={C.muted} style={{ marginBottom: 6 }}>For how long? (max {MAX_WEEKS} weeks, one semester)</T>
          <Stepper value={weeks} onChange={setWeeks} max={MAX_WEEKS} suffix="weeks" />
          <View style={{ height: 14 }} />
          {plan.ok ? (
            <Card tone="indigo" style={{ padding: 18 }}>
              <T w="semi" size={13} color="#C9CCF5">{kid} gets</T>
              <T w="heavy" size={34} color="#fff" style={{ letterSpacing: -0.8 }}>{usd(plan.perPayout)}</T>
              <T w="semi" size={14} color="#fff">{cadence} · ≈ {naira(toNaira(plan.perPayout))}</T>
              <T size={12} color="#C9CCF5" style={{ marginTop: 8 }}>
                We work out the payday for you, so nothing is left stuck in the vault.
              </T>
            </Card>
          ) : null}
          {plan.errors.map((e) => <Notice key={e} icon="close-circle" tone="danger">{e}</Notice>)}
          {plan.warnings.map((w) => <Notice key={w} icon="alert-circle" tone="caution">{w}</Notice>)}
        </>
      ) : null}

      {step === 1 ? (
        <>
          <T w="bold" size={15}>Emergency pot</T>
          <T size={12.5} color={C.muted} style={{ marginTop: 2, marginBottom: 10 }}>
            {kid} can unlock it instantly, once a month, without asking. You're told, not asked.
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {[10, 15, 20, 25].map((v) => (
              <Chip key={v} label={`${v}% · ${usd((Number(total) * v) / 100)}`} selected={emergencyPct === v} onPress={() => setEmergencyPct(v)} />
            ))}
          </View>
          <Card style={{ paddingVertical: 2, marginTop: 8 }}>
            <Toggle label="Allow pulling paydays forward" sub="Up to 2 a month. Later paydays shrink to match. Never below $10." value={allowPullForward} onValueChange={setAllowPullForward} />
            <Toggle label="Reserve money for school fees" sub="Paid only to the school's official channel." value={feesOn} onValueChange={setFeesOn} />
          </Card>
          {feesOn ? (
            <>
              <Field label="Fees amount" prefix="$" value={fees} onChangeText={setFees} keyboardType="decimal-pad" hint="For University of Uyo · deadline 15 Dec" />
              <T w="semi" size={13} color={C.muted} style={{ marginBottom: 8 }}>If fees aren't used by the deadline, the money goes</T>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Chip label="Back to me" selected={feesUnused === "sponsor"} onPress={() => setFeesUnused("sponsor")} />
                <Chip label={`To ${kid}`} selected={feesUnused === "student"} onPress={() => setFeesUnused("student")} />
              </View>
              <T size={12} color={C.muted}>{kid} sees this choice before accepting.</T>
            </>
          ) : null}
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Notice icon="moon">
            If you don't answer one of {kid}'s asks within 6 hours, your backup can approve it. Houston is 7 hours behind Uyo in winter.
          </Notice>
          <Field label="Backup approver's name" value={backupName} onChangeText={setBackupName} />
          <Field label="City" value={backupCity} onChangeText={setBackupCity} />
          <Field label="Phone" value="+234 803 000 0000" editable={false} hint="They'll get an invite to confirm." />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <Card style={{ paddingVertical: 4 }}>
            <ListItem icon="calendar" title={`${usd(plan.perPayout)} ${cadence}`} subtitle={`${plan.payouts} paydays over ${plan.weeks} weeks · into ${kid}'s Cleva account`} />
            <ListItem icon="medkit" title={`${usd(plan.emergencyPot)} emergency pot`} subtitle="Once a month, no approval. Unused money goes to the student at the end." />
            {plan.fees ? <ListItem icon="school" title={`${usd(plan.fees)} school fees`} subtitle={`University of Uyo only · unused → ${feesUnused === "sponsor" ? "back to you" : kid}`} /> : null}
            <ListItem icon="people" title={`Backup: ${backupName}`} subtitle={backupCity} />
            <ListItem icon="lock-closed" title={`Total to fund: ${usd(plan.vaultTotal)}`} subtitle="Held by the vault's rules, not by Wellsent" last />
          </Card>
          <Promises title={`${kid}'s 5 promises`} />
        </>
      ) : null}
    </Screen>
  );
}
