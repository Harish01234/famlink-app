import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChildDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: COLORS.white }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: COLORS.navy,
          marginBottom: 15,
        }}
      >
        Child Details
      </Text>

      <Text style={{ fontSize: 16, color: COLORS.navy }}>
        Child ID: {id}
      </Text>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(parents)/(child)/track/[id]",
            params: { id: String(id) },
          })
        }
        style={{
          backgroundColor: COLORS.primary,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 25,
        }}
      >
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "700" }}>
          Track Live Location
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
