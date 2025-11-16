import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function ParentHome() {
  const router = useRouter();

  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const API = "http://168.231.123.52:4000";

  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  // ----------------------------------------------
  // 🔵 Fetch family members from DB
  // ----------------------------------------------
  async function fetchMembers(familyId: string) {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Error", "You are not logged in.");
        return;
      }

      const res = await fetch(`${API}/api/family/members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ familyId }),
      });

      const data = await res.json();

      if (data.success) {
        setMembers(data.members);
      } else {
        Alert.alert("Error", "Failed to load family members.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong loading members.");
    }
  }

  // ----------------------------------------------
  // 🔵 Load family from secure store & DB
  // ----------------------------------------------
  async function loadFamily() {
    setLoading(true);

    const familyId = await SecureStore.getItemAsync("familyId");

    const familyName = await SecureStore.getItemAsync("familyName");
    const inviteCode = await SecureStore.getItemAsync("inviteCode");

    if (familyId) {
      // If family exists → Set it
      setFamily({
        _id: familyId,
        familyName,
        inviteCode,
      });

      await fetchMembers(familyId);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadFamily();
  }, []);

  // ----------------------------------------------
  // 🟢 Create Family
  // ----------------------------------------------
  async function createFamily() {
    try {
      const token = await SecureStore.getItemAsync("token");

      const res = await fetch(`${API}/api/family/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ familyName: "My Family" }),
      });

      const data = await res.json();

      if (!data.family) {
        return Alert.alert("Error", "Could not create family");
      }

      // Save locally
      await SecureStore.setItemAsync("familyId", data.family._id);
      await SecureStore.setItemAsync("familyName", data.family.familyName);
      await SecureStore.setItemAsync("inviteCode", data.family.inviteCode);

      // Update UI
      setFamily(data.family);

      Alert.alert("Success", "Family created!");

      await fetchMembers(data.family._id);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong.");
    }
  }

  // ----------------------------------------------
  // 🔴 Logout
  // ----------------------------------------------
  async function logout() {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("familyId");
    await SecureStore.deleteItemAsync("familyName");
    await SecureStore.deleteItemAsync("inviteCode");

    Alert.alert("Logged Out", "You have been logged out.");
    router.replace("/(auth)/login");
  }

  // ----------------------------------------------
  // ⏳ Loading Screen
  // ----------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // ----------------------------------------------
  // MAIN UI
  // ----------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "700", color: COLORS.navy }}>
          Parent Dashboard
        </Text>

        {/* If no family yet */}
        {!family && (
          <View style={{ marginTop: 30 }}>
            <TouchableOpacity
              onPress={createFamily}
              style={{
                backgroundColor: COLORS.primary,
                padding: 16,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
                Create Family
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* If family exists */}
        {family && (
          <>
            {/* Family Info Card */}
            <View
              style={{
                marginTop: 20,
                padding: 20,
                backgroundColor: COLORS.primary,
                borderRadius: 15,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700", color: COLORS.white }}>
                Your Family
              </Text>

              <Text style={{ color: COLORS.white, marginTop: 8 }}>
                Family Name: {family.familyName}
              </Text>

              <Text style={{ color: COLORS.white, marginTop: 3 }}>
                Invite Code: {family.inviteCode}
              </Text>

              <Text style={{ color: COLORS.white, marginTop: 3 }}>
                Members: {members.length}
              </Text>
            </View>

            {/* Member List */}
            <Text
              style={{
                marginTop: 20,
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.navy,
              }}
            >
              Members
            </Text>

            <FlatList
              data={members}
              keyExtractor={(item) => item._id}
              style={{ marginTop: 10 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: COLORS.grey,
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: "600", color: COLORS.navy }}>
                    {item.name} ({item.role})
                  </Text>
                  <Text style={{ color: COLORS.navy, opacity: 0.7 }}>
                    {item.email}
                  </Text>
                </View>
              )}
            />

            {/* Add Child */}
            <TouchableOpacity
              onPress={() => router.push("/(parents)/add-child")}
              style={{
                backgroundColor: COLORS.primary,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: "700" }}>Add Child</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              onPress={logout}
              style={{
                backgroundColor: COLORS.navy,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: "700" }}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
