import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

import LogoutButton from "@/components/LogoutButton";

import {
  startChildLocationUpdates,
  stopChildLocationUpdates,
  isChildLocationTaskRunning,
} from "@/tasks/childLocationTask";

const API = "http://168.231.123.52:4000";

// 🔥 FIXED CHILD ID HERE ALSO
const FIXED_CHILD_ID = "69199663f20f1f9df76b7518";

export default function ChildDashboard() {
  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const [sendingOnce, setSendingOnce] = useState(false);
  const [bgRunning, setBgRunning] = useState(false);
  const [lastManualSent, setLastManualSent] = useState<string | null>(null);

  // -----------------------------------------------------
  // Load background task status
  // -----------------------------------------------------
  useEffect(() => {
    const check = async () => {
      const running = await isChildLocationTaskRunning();
      setBgRunning(running);
    };
    check();
  }, []);

  // -----------------------------------------------------
  // MANUAL SEND ONCE
  // -----------------------------------------------------
  const sendLocationOnce = async () => {
    try {
      setSendingOnce(true);

      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "Login again.");

      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") {
        Alert.alert("Permission", "Foreground location required.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await fetch(`${API}/api/location/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childId: FIXED_CHILD_ID, // 🔥 FIXED
          lat,
          lng,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        Alert.alert("Error", "Failed to send");
        return;
      }

      setLastManualSent(new Date().toLocaleTimeString());
      Alert.alert("Success", "Location sent!");
    } finally {
      setSendingOnce(false);
    }
  };

  // -----------------------------------------------------
  // BACKGROUND START
  // -----------------------------------------------------
  const startBackground = async () => {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== "granted") {
      Alert.alert("Permission", "Foreground location required.");
      return;
    }

    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== "granted") {
      Alert.alert("Permission", "Background location required.");
      return;
    }

    await startChildLocationUpdates();
    const running = await isChildLocationTaskRunning();
    setBgRunning(running);

    Alert.alert("Enabled", "Background sharing started.");
  };

  // -----------------------------------------------------
  // BACKGROUND STOP
  // -----------------------------------------------------
  const stopBackground = async () => {
    await stopChildLocationUpdates();
    const running = await isChildLocationTaskRunning();
    setBgRunning(running);

    Alert.alert("Stopped", "Background sharing stopped.");
  };

  const toggleBackground = async () => {
    if (bgRunning) stopBackground();
    else startBackground();
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 20, flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.navy }}>
            Child Dashboard
          </Text>
          <LogoutButton />
        </View>

        {/* BACKGROUND STATUS */}
        <View
          style={{
            backgroundColor: COLORS.grey,
            padding: 16,
            borderRadius: 14,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.navy }}>
            Background Location Sharing
          </Text>

          <Text style={{ color: COLORS.navy, marginTop: 8 }}>
            Status: {bgRunning ? "RUNNING" : "STOPPED"}
          </Text>

          {lastManualSent && (
            <Text style={{ color: COLORS.navy, marginTop: 6 }}>
              Last Manual Send: {lastManualSent}
            </Text>
          )}
        </View>

        {/* BACKGROUND TOGGLE */}
        <TouchableOpacity
          onPress={toggleBackground}
          style={{
            backgroundColor: bgRunning ? "#D9534F" : COLORS.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
            {bgRunning ? "Stop Background Sharing" : "Start Background Sharing"}
          </Text>
        </TouchableOpacity>

        {/* MANUAL SEND */}
        <TouchableOpacity
          onPress={sendLocationOnce}
          disabled={sendingOnce}
          style={{
            backgroundColor: COLORS.navy,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {sendingOnce && (
            <ActivityIndicator size="small" style={{ marginRight: 8 }} color={COLORS.white} />
          )}

          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
            Send Location Once
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
