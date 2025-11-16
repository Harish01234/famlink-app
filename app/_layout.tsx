// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      // Simulate small startup delay (optional)
      await new Promise((resolve) => setTimeout(resolve, 200));
      setIsReady(true);
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "#fff" },
      }}
    >
      {/* index.tsx (splash redirect) */}
      <Stack.Screen name="index" />

      {/* Auth screens group */}
      <Stack.Screen name="(auth)" />

      {/* Parent screens */}
      <Stack.Screen name="(parents)" />

      {/* Child screens */}
      <Stack.Screen name="(children)" />
    </Stack>
  );
}
