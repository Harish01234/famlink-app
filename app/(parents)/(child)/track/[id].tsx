import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function TrackChild() {
  const { id } = useLocalSearchParams();

  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white, padding: 20 }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: COLORS.navy,
          marginBottom: 15,
        }}
      >
        Tracking Child
      </Text>

      <Text style={{ fontSize: 16, color: COLORS.navy }}>
        Child ID: {id}
      </Text>

      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.grey,
          marginTop: 20,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: COLORS.navy }}>
          Map will appear here (WS + live updates)
        </Text>
      </View>
    </View>
  );
}
