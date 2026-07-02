import React, { useState, useEffect, useSyncExternalStore } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";

import Onboarding from "./src/screens/Onboarding";
import Home from "./src/screens/Home";
import Spending from "./src/screens/Spending";
import Goals from "./src/screens/Goals";
import Watch from "./src/screens/Watch";
import Prices from "./src/screens/Prices";
import { C } from "./src/theme/theme";
import { usingDemo, ensureSession } from "./src/api/client";

const Tab = createBottomTabNavigator();

const ICONS = { Home: "🏠", Spending: "📊", Goals: "🎯", Watch: "🛡️", Prices: "🏷️" };

function DemoBadge() {
  // Small honest indicator when the API is unreachable and bundled data is shown.
  const demo = useSyncExternalStore(
    (cb) => usingDemo.subscribe(cb),
    () => usingDemo.value
  );
  if (!demo) return null;
  return (
    <View style={{ position: "absolute", top: 46, alignSelf: "center", backgroundColor: C.goldSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, zIndex: 10 }}>
      <Text style={{ color: C.gold, fontSize: 10.5, fontWeight: "700" }}>demo data · API offline</Text>
    </View>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Sign in to the API while the user reads the onboarding slides, so the
  // tabs load live data the moment they enter.
  useEffect(() => {
    ensureSession().finally(() => setSessionReady(true));
  }, []);

  if (!onboarded) {
    return (
      <>
        <StatusBar style="light" />
        <Onboarding onDone={() => setOnboarded(true)} />
      </>
    );
  }

  if (!sessionReady) {
    // Only reachable if someone sprints through onboarding faster than the
    // login round-trip — a paper-coloured beat, never a white flash.
    return <View style={{ flex: 1, backgroundColor: C.paper }} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <DemoBadge />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: C.royal,
          tabBarInactiveTintColor: C.faint,
          tabBarStyle: { backgroundColor: "#fff", borderTopColor: C.line, height: 62, paddingBottom: 8 },
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Spending" component={Spending} />
        <Tab.Screen name="Goals" component={Goals} />
        <Tab.Screen name="Watch" component={Watch} />
        <Tab.Screen name="Prices" component={Prices} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
