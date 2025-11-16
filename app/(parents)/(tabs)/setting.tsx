import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from SecureStore
  async function loadUser() {
    try {
      const token = await SecureStore.getItemAsync("token");
      const name = await SecureStore.getItemAsync("name");
      const email = await SecureStore.getItemAsync("email");
      const role = await SecureStore.getItemAsync("role");

      if (token) {
        setUser({ name, email, role });
      }
    } catch (err) {
      console.log("Error loading user:", err);
    }
    setLoading(false);
  }

  // On mount
  useEffect(() => {
    loadUser();
  }, []);

  // Logout function
  async function logout() {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("name");
    await SecureStore.deleteItemAsync("email");
    await SecureStore.deleteItemAsync("role");

    router.replace("/(auth)/login");
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 20 }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: COLORS.navy,
          marginBottom: 20,
        }}
      >
        Settings
      </Text>

      {/* User box */}
      <View
        style={{
          backgroundColor: COLORS.grey,
          padding: 20,
          borderRadius: 12,
          marginBottom: 30,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.navy }}>
          {user?.name || "User"}
        </Text>

        <Text style={{ fontSize: 15, marginTop: 6, color: COLORS.navy }}>
          📧 {user?.email}
        </Text>

        <Text style={{ fontSize: 15, marginTop: 4, color: COLORS.navy }}>
          👤 Role: {user?.role}
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: COLORS.primary,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}
        >
          Log Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
