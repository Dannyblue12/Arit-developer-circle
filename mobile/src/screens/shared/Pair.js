import React, { useState } from "react";
import { View, Share } from "react-native";
import { C, shortAddr, initials } from "../../theme/theme";
import { Screen, TopBar, Card, T, Button, Field, Pill, IconChip, Notice } from "../../components/UI";
import { useStore, DEMO } from "../../state/store";
import SetupSteps, { STUDENT_STEPS, SPONSOR_STEPS } from "../../components/SetupSteps";
import { Asset, Float } from "../../components/Brand";

function Avatar({ initials, tone = C.indigo }) {
  return (
    <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: tone, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
      <T w="heavy" size={16} color="#fff">{initials}</T>
    </View>
  );
}

export default function Pair({ route }) {
  const role = route.params?.role || "student";
  const { state, actions } = useStore();
  const [code, setCode] = useState("");
  const [found, setFound] = useState(false);

  if (role === "student") {
    const invite = `Hi! I'm using Wellsent so my upkeep lands safely in my Cleva account every week. Join with my code ${DEMO.inviteCode}`;
    return (
      <Screen footer={<Button label="Aunty Ini joined (demo)" variant="dark" icon="people" onPress={actions.pair} />}>
        <TopBar
          top={<SetupSteps steps={STUDENT_STEPS} current={2} />}
          title="Invite who supports you"
          sub="A parent, aunty, uncle or sponsor. They set up your plan, and you accept it before anything starts."
        />
        <Card gradient="indigo" style={{ alignItems: "center", paddingVertical: 22, overflow: "hidden" }}>
          <Float amplitude={6} style={{ position: "absolute", right: -14, top: -12 }}><Asset name="coin" size={86} /></Float>
          <T w="semi" size={13} color="#DADCFF">Your invite code</T>
          <T w="heavy" size={36} color="#fff" style={{ letterSpacing: 3, marginTop: 6 }}>{DEMO.inviteCode}</T>
          <Button label="Share on WhatsApp" variant="gold" icon="logo-whatsapp" style={{ alignSelf: "stretch", marginTop: 16 }} onPress={() => Share.share({ message: invite })} />
        </Card>
        {state.cleva ? (
          <Card style={{ flexDirection: "row", alignItems: "center" }}>
            <IconChip icon="wallet" tone="safe" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <T w="bold">Cleva payday address saved</T>
              <T size={12.5} color={C.muted}>{shortAddr(state.cleva.address)} · {state.cleva.network}</T>
            </View>
            <Pill text="Verified" tone="safe" icon="checkmark" />
          </Card>
        ) : null}
        <Notice icon="chatbubbles">
          Tell your family: “I will only ever ask for money inside Wellsent.” That one rule stops “new number” scams.
        </Notice>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        found ? (
          <Button label="Continue" onPress={actions.pair} />
        ) : (
          <Button label="Find my student" onPress={() => setFound(true)} disabled={code.trim().length < 4} />
        )
      }
    >
      <TopBar
        top={<SetupSteps steps={SPONSOR_STEPS} current={1} />}
        title="Connect to your student"
        sub="Enter the invite code your student sent you on WhatsApp."
      />
      <Field
        label="Invite code"
        value={code}
        onChangeText={(v) => setCode(v.toUpperCase())}
        placeholder="WS-XXXX"
        autoCapitalize="characters"
        hint={`Demo code: ${DEMO.inviteCode}`}
      />
      {found ? (
        <Card style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar initials={initials(state.student.name)} />
          <View style={{ flex: 1 }}>
            <T w="bold" size={15}>{state.student.name}</T>
            <T size={12.5} color={C.muted}>{state.student.school}</T>
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              <Pill text="Cleva verified" tone="safe" icon="checkmark-circle" style={{ marginRight: 6 }} />
              <Pill text="Payday address set" tone="indigo" icon="wallet" />
            </View>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
