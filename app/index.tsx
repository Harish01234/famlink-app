// app/index.tsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const role = await SecureStore.getItemAsync("role");

        // No token → go to login
        if (!token) {
          router.replace("/(auth)/login");
          return;
        }

        // Token exists → redirect by role
        if (role === "parent") {
          router.replace("/(parents)/(tabs)/home");
        } else if (role === "child") {
          router.replace("/(children)/dashboard");
        } else {
          // fallback (role missing? force logout)
          await SecureStore.deleteItemAsync("token");
          router.replace("/(auth)/login");
        }
      } catch (err) {
        console.log("Splash error:", err);
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
