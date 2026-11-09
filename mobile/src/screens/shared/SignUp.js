import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { C } from "../../theme/theme";
import { Screen, TopBar, Field, Button, Notice, T } from "../../components/UI";
import { useStore } from "../../state/store";

export default function SignUp({ navigation, route }) {
  const role = route.params?.role || "student";
  const student = role === "student";
  const { actions } = useStore();
  const [name, setName] = useState(student ? "Chidi Okon" : "Ini Bassey");
  const [phone, setPhone] = useState(student ? "0801 000 0000" : "713 555 0142");
  const [nickname, setNickname] = useState("Aunty Ini");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  const done = code.trim().length === 6;

  const next = () => {
    actions.signUp({ role, name, phone, first: student ? undefined : nickname });
    navigation.navigate(student ? "ConnectCleva" : "Pair", { role });
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
        title="Create your account"
        sub={student ? "Your family will see this name when you ask for money." : "Your student will see this name on their plan."}
      />
      <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
      {!student ? (
        <Field
          label="What does your student call you?"
          value={nickname}
          onChangeText={setNickname}
          hint="Shown on their plan and on every payday."
        />
      ) : null}
      <Field
        label="Phone number"
        prefix={student ? "+234" : "+1"}
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
        Wellsent never holds your money or your keys. {student ? "Paydays go straight to your own Cleva account." : "Your money sits in a vault only you and the plan rules control."}
      </Notice>
      <T size={12} color={C.faint} style={{ marginTop: 6 }}>
        Signing up as {student ? "a student" : "a sponsor"}.
      </T>
    </Screen>
  );
}
