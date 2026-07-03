import React, { useState, useEffect, useSyncExternalStore } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import Onboarding from "./src/screens/Onboarding";
import Home from "./src/screens/Home";
import Spending from "./src/screens/Spending";
import Goals from "./src/screens/Goals";
import Watch from "./src/screens/Watch";
import Prices from "./src/screens/Prices";
import { C } from "./src/theme/theme";
import { usingDemo, ensureSession, watchDanger, getWatch } from "./src/api/client";

const Tab = createBottomTabNavigator();

// Uniform Ionicons set: outline at rest, filled when active.
const ICONS = {
  Home: ["home-outline", "home"],
  Spending: ["pie-chart-outline", "pie-chart"],
  Goals: ["flag-outline", "flag"],
  Watch: ["shield-outline", "shield"],
  Prices: ["pricetag-outline", "pricetag"],
};

function TabIcon({ name, color, focused }) {
  const danger = useSyncExternalStore(
    (cb) => watchDanger.subscribe(cb),
    () => watchDanger.value
  );
  return (
    <View>
      <Ionicons name={ICONS[name][focused ? 1 : 0]} size={21} color={color} />
      {name === "Watch" && danger && (
        <View
          style={{
            position: "absolute", top: -1, right: -7, width: 9, height: 9,
            borderRadius: 5, backgroundColor: C.live, borderWidth: 1.5, borderColor: "#fff",
          }}
        />
      )}
    </View>
  );
}

function DemoBadge() {
  // Small honest indicator when the API is unreachable and bundled data is shown.
  const demo = useSyncExternalStore(
    (cb) => usingDemo.subscribe(cb),
    () => usingDemo.value
  );
  if (!demo) return null;
  return (
    <View style={{ position: "absolute", top: 16, alignSelf: "center", backgroundColor: C.goldSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, zIndex: 10 }}>
      <Text style={{ color: C.gold, fontSize: 10.5, fontWeight: "700" }}>demo data · API offline</Text>
    </View>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Sign in to the API while the user reads the onboarding slides, so the
  // tabs load live data the moment they enter. Prime the Watch state so the
  // tab badge is truthful before the tab is ever opened.
  useEffect(() => {
    ensureSession()
      .then(() => getWatch())
      .catch(() => {})
      .finally(() => setSessionReady(true));
  }, []);

  if (!onboarded) {
    // Onboarding sets its own status bar style (light on the dark welcome
    // screen, dark on the paper slides).
    return <Onboarding onDone={() => setOnboarded(true)} />;
  }

  if (!sessionReady) {
    // Only reachable if someone sprints through onboarding faster than the
    // login round-trip — a paper-coloured beat, never a white flash.
    return <View style={{ flex: 1, backgroundColor: C.paper }} />;
  }

  return (
    <NavigationContainer>
      {/* Immersive full-screen: the device status bar stays hidden in-app. */}
      <StatusBar hidden />
      <DemoBadge />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: C.royal,
          tabBarInactiveTintColor: C.faint,
          tabBarStyle: {
            backgroundColor: "#fff", borderTopColor: C.line, borderTopWidth: 1,
            height: 66, paddingBottom: 10, paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={route.name} color={color} focused={focused} />
          ),
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
