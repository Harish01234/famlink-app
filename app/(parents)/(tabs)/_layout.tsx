import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ParentTabsLayout() {
  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Active & inactive colors
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.navy,

        // Tab bar styling
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.grey,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />

      {/* MAP */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={22} color={color} />
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
