import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { C } from "../../theme/theme";
import { Screen, TopBar, Field, Button, Notice, T } from "../../components/UI";
import { useStore } from "../../state/store";
import SetupSteps, { STUDENT_STEPS, SPONSOR_STEPS, SELF_STEPS } from "../../components/SetupSteps";

const COPY = {
  student: {
    steps: STUDENT_STEPS, name: "Chidi Okon", phone: "0801 000 0000", prefix: "+234",
    sub: "The person supporting you will see this name when you ask for money.",
    lock: "Paydays go straight to your own Cleva account.",
    as: "someone receiving support",
  },
  sponsor: {
    steps: SPONSOR_STEPS, name: "Ini Bassey", phone: "713 555 0142", prefix: "+1",
    sub: "The person you support will see this name on their plan.",
    lock: "Your money sits in a vault only you and the plan rules control.",
    as: "a supporter",
  },
  self: {
    steps: SELF_STEPS, name: "Ada Nwosu", phone: "0802 000 0000", prefix: "+234",
    sub: "Turn big, irregular payments into a steady weekly payday.",
    lock: "Your income sits in your own vault and lands in your own Cleva account.",
    as: "someone paying themselves",
  },
};

export default function SignUp({ navigation, route }) {
  const role = route.params?.role || "student";
  const student = role === "student";
  const sponsor = role === "sponsor";
  const copy = COPY[role] || COPY.student;
  const { actions } = useStore();
  const [name, setName] = useState(copy.name);
  const [phone, setPhone] = useState(copy.phone);
  const [nickname, setNickname] = useState("Aunty Ini");
  const [work, setWork] = useState("Freelance product designer");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  const done = code.trim().length === 6;

  const next = () => {
    actions.signUp({ role, name, phone, first: sponsor ? nickname : undefined, work: role === "self" ? work : undefined });
    navigation.navigate(sponsor ? "Pair" : "ConnectCleva", { role });
  };

  return (
    <Screen
      footer={
        sent ? (
          <Button label="Continue" onPress={next} disabled={!done} />
        ) : (
          <Button label="Send code" onPress={() => setSent(true)} disabled={!name || phone.length < 7} />
        )
      }
    >
      <StatusBar style="dark" />
      <TopBar
        onBack={() => navigation.goBack()}
        top={<SetupSteps steps={copy.steps} current={0} />}
        title="Create your account"
        sub={copy.sub}
      />
      <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
      {sponsor ? (
        <Field
          label="What do they call you?"
          value={nickname}
          onChangeText={setNickname}
          hint="Shown on their plan and on every payday."
        />
      ) : null}
      {role === "self" ? (
        <Field label="What do you do?" value={work} onChangeText={setWork} hint="Freelancer, remote worker, creator, trader…" />
      ) : null}
      <Field
        label="Phone number"
        prefix={copy.prefix}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {sent ? (
        <View>
          <Field
            label="6-digit code"
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            placeholder="••••••"
            inputStyle={{ letterSpacing: 8, fontSize: 20 }}
            hint="Demo: type any 6 digits, e.g. 123456"
          />
        </View>
      ) : null}
      <Notice icon="lock-closed">
        Wellsent never holds your money or your keys. {copy.lock}
      </Notice>
      <T size={12} color={C.faint} style={{ marginTop: 6 }}>
        Signing up as {copy.as}.
      </T>
    </Screen>
  );
}
