import React, { useMemo, useRef } from "react";
import { View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { C, F } from "./src/theme/theme";
import { StoreProvider, useStore, bootFromUrl } from "./src/state/store";

import Welcome from "./src/screens/shared/Welcome";
import SignUp from "./src/screens/shared/SignUp";
import ConnectCleva from "./src/screens/shared/ConnectCleva";
import Pair from "./src/screens/shared/Pair";
import ShieldCheck from "./src/screens/shared/ShieldCheck";

import StudentHome from "./src/screens/student/StudentHome";
import PlanInvite from "./src/screens/student/PlanInvite";
import PaydayLanded from "./src/screens/student/PaydayLanded";
import StudentAsks from "./src/screens/student/StudentAsks";
import AskNew from "./src/screens/student/AskNew";
import Emergency from "./src/screens/student/Emergency";
import PullForward from "./src/screens/student/PullForward";
import Fees from "./src/screens/student/Fees";
import CheckIn from "./src/screens/student/CheckIn";
import Activity from "./src/screens/student/Activity";
import StudentMe from "./src/screens/student/StudentMe";

import SponsorHome from "./src/screens/sponsor/SponsorHome";
import CreatePlan from "./src/screens/sponsor/CreatePlan";
import FundVault from "./src/screens/sponsor/FundVault";
import SponsorAsks from "./src/screens/sponsor/SponsorAsks";
import AskDetail from "./src/screens/sponsor/AskDetail";
import ScamCheck from "./src/screens/sponsor/ScamCheck";
import PlanDetail from "./src/screens/sponsor/PlanDetail";
import SponsorMe from "./src/screens/sponsor/SponsorMe";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Outline at rest, filled when active.
const ICONS = {
  Home: "home",
  Asks: "chatbubbles",
  Activity: "time",
  Me: "person-circle",
};

const tabOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: C.indigo,
  tabBarInactiveTintColor: C.faint,
  tabBarStyle: { backgroundColor: "#fff", borderTopColor: C.line, height: 66, paddingBottom: 10, paddingTop: 6 },
  tabBarLabelStyle: { fontFamily: F.semi, fontSize: 11 },
  tabBarBadgeStyle: { backgroundColor: C.gold, color: C.ink, fontFamily: F.bold, fontSize: 11 },
  tabBarIcon: ({ color, focused }) => (
    <Ionicons name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`} size={22} color={color} />
  ),
});

function StudentTabs() {
  const { state } = useStore();
  const waiting = state.asks.filter((k) => k.status === "pending").length;
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Home" component={StudentHome} />
      <Tab.Screen name="Asks" component={StudentAsks} options={{ tabBarBadge: waiting || undefined }} />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="Me" component={StudentMe} />
    </Tab.Navigator>
  );
}

function SponsorTabs() {
  const { state } = useStore();
  const waiting = state.asks.filter((k) => k.status === "pending").length;
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen name="Home" component={SponsorHome} />
      <Tab.Screen name="Asks" component={SponsorAsks} options={{ tabBarBadge: waiting || undefined }} />
      <Tab.Screen name="Me" component={SponsorMe} />
    </Tab.Navigator>
  );
}

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: C.paper, primary: C.indigo } };

function Root({ initialScreen }) {
  const { state } = useStore();
  // Keyed by who is using the phone, so switching role in the demo starts
  // that person's app fresh.
  const group = !state.onboarded ? "onboarding" : state.role;
  // ?screen= only applies to the first screen group shown.
  const firstGroup = useRef(group);
  const initial = group === firstGroup.current ? initialScreen : undefined;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        key={group}
        initialRouteName={initial}
        screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: C.paper } }}
      >
        {group === "onboarding" ? (
          <>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ConnectCleva" component={ConnectCleva} />
            <Stack.Screen name="Pair" component={Pair} />
          </>
        ) : group === "student" ? (
          <>
            <Stack.Screen name="StudentTabs" component={StudentTabs} />
            <Stack.Screen name="PlanInvite" component={PlanInvite} />
            <Stack.Screen name="PaydayLanded" component={PaydayLanded} options={{ animation: "fade" }} />
            <Stack.Screen name="AskNew" component={AskNew} />
            <Stack.Screen name="Emergency" component={Emergency} />
            <Stack.Screen name="PullForward" component={PullForward} />
            <Stack.Screen name="Fees" component={Fees} />
            <Stack.Screen name="CheckIn" component={CheckIn} />
            <Stack.Screen name="ShieldCheck" component={ShieldCheck} />
          </>
        ) : (
          <>
            <Stack.Screen name="SponsorTabs" component={SponsorTabs} />
            <Stack.Screen name="CreatePlan" component={CreatePlan} />
            <Stack.Screen name="FundVault" component={FundVault} />
            <Stack.Screen name="AskDetail" component={AskDetail} />
            <Stack.Screen name="ScamCheck" component={ScamCheck} />
            <Stack.Screen name="PlanDetail" component={PlanDetail} />
            <Stack.Screen name="ShieldCheck" component={ShieldCheck} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const boot = useMemo(() => bootFromUrl(), []);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.ink }} />;

  return (
    <SafeAreaProvider>
      <StoreProvider initial={boot.state}>
        <Root initialScreen={boot.screen} />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
