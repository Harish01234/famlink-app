import { Stack } from "expo-router";

export default function ChildLayout() {
  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerShadowVisible: false, // cleaner iOS-style header
        headerTintColor: COLORS.navy, // back icon + title color
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        // remove "Back" text (cleaner UI)
      }}
    >
      {/* 1. Child List (first screen in stack) */}
      <Stack.Screen
        name="index"
        options={{
          title: "Children",
        }}
      />

      {/* 2. Child Details */}
      <Stack.Screen
        name="[id]"
        options={{
          title: "Child Details",
        }}
      />

      {/* 3. Track Child */}
      <Stack.Screen
        name="track/[id]"
        options={{
          title: "Track Child",
        }}
      />
    </Stack>
  );
}
