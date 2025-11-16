import { TouchableOpacity, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function LogoutButton() {
  const router = useRouter();

  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("role");

    router.replace("/(auth)/login");
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
      }}
    >
      <Text
        style={{
          color: COLORS.white,
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        Logout
      </Text>
    </TouchableOpacity>
  );
}
