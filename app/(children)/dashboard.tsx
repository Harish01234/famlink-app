import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import LogoutButton from "@/components/LogoutButton";

export default function ChildDashboard() {
  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const API = "http://168.231.123.52:4000";

  // 🟢 Hardcoded child ID (your requirement)
  const childId = "69199663f20f1f9df76b7518";

  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  // NEW STATES (for join family)
  const [joinCode, setJoinCode] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  // ---------------------------------------------
  // 🔵 Send location to backend
  // ---------------------------------------------
  const sendLocationOnce = async () => {
    try {
      setSending(true);

      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "Missing token. Relogin.");

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location access needed.");
        setSharingEnabled(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await fetch(`${API}/api/location/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ childId, lat, lng }),
      });

      const data = await res.json();
      if (!data.success) return Alert.alert("Error", "Failed to send location");

      const time = new Date().toLocaleTimeString();
      setLastSent(time);
    } catch (err) {
      console.log("Location update error:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  // ---------------------------------------------
  // 🟢 Start sharing
  // ---------------------------------------------
  const startSharing = async () => {
    await sendLocationOnce();

    intervalRef.current = setInterval(sendLocationOnce, 120000);
    setSharingEnabled(true);

    Alert.alert("Enabled", "Location sharing started");
  };

  // ---------------------------------------------
  // 🔴 Stop sharing
  // ---------------------------------------------
  const stopSharing = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    setSharingEnabled(false);

    Alert.alert("Stopped", "Location sharing stopped");
  };

  const toggleSharing = async () => {
    sharingEnabled ? stopSharing() : await startSharing();
  };

  // ---------------------------------------------------
  // 🟣 Join Family by Code
  // ---------------------------------------------------
  const joinFamilyByCode = async () => {
    if (!joinCode.trim()) {
      return Alert.alert("Error", "Enter a valid code");
    }

    try {
      const token = await SecureStore.getItemAsync("token");

      const res = await fetch(`${API}/api/family/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode: joinCode }),
      });

      const data = await res.json();

      if (!data.family) {
        return Alert.alert("Error", "Invalid family code");
      }

      // Save family details locally
      await SecureStore.setItemAsync("familyId", data.family._id);
      await SecureStore.setItemAsync("familyName", data.family.familyName);
      await SecureStore.setItemAsync("inviteCode", data.family.inviteCode);

      Alert.alert("Joined!", "You successfully joined a family group");
      setJoinCode("");
    } catch (err) {
      console.log("Join error:", err);
      Alert.alert("Error", "Something went wrong while joining");
    }
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 20, flex: 1 }}>
        
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.navy }}>
            Child Dashboard
          </Text>
          <LogoutButton />
        </View>

        {/* JOIN FAMILY SECTION */}
        <View
          style={{
            backgroundColor: COLORS.grey,
            padding: 16,
            borderRadius: 14,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.navy }}>
            Join Family
          </Text>

          <TextInput
            placeholder="Enter family code"
            placeholderTextColor={COLORS.navy}
            value={joinCode}
            onChangeText={setJoinCode}
            style={{
              marginTop: 12,
              backgroundColor: COLORS.white,
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: COLORS.grey,
              color: COLORS.navy,
            }}
          />

          <TouchableOpacity
            onPress={joinFamilyByCode}
            style={{
              backgroundColor: COLORS.primary,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: "700" }}>
              Join Family
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATUS CARD */}
        <View
          style={{
            backgroundColor: COLORS.grey,
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.navy }}>
            Location Sharing
          </Text>
          <Text style={{ color: COLORS.navy, opacity: 0.7, marginTop: 6 }}>
            {sharingEnabled
              ? "Your location is being shared every 2 minutes."
              : "Your location is not being shared."}
          </Text>

          {lastSent && (
            <Text style={{ color: COLORS.navy, opacity: 0.7, marginTop: 5 }}>
              Last sent: {lastSent}
            </Text>
          )}
        </View>

        {/* TOGGLE BUTTON */}
        <TouchableOpacity
          onPress={toggleSharing}
          disabled={sending}
          style={{
            backgroundColor: sharingEnabled ? "#D9534F" : COLORS.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {sending && (
            <ActivityIndicator
              size="small"
              style={{ marginRight: 8 }}
              color={COLORS.white}
            />
          )}
          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
            {sharingEnabled ? "Stop Location Sharing" : "Start Location Sharing"}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
