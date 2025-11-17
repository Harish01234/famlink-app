import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";

import LogoutButton from "@/components/LogoutButton";

import {
  CHILD_LOCATION_TASK,
  registerChildLocationTask,
  unregisterChildLocationTask,
  getChildLocationTaskInfo,
} from "@/tasks/childLocationTask";

export default function ChildDashboard() {
  const COLORS = {
    primary: "#2ECC71",
    navy: "#1A3C57",
    grey: "#F2F4F7",
    white: "#FFFFFF",
  };

  const API = "http://168.231.123.52:4000";
  const childId = "69199663f20f1f9df76b7518";

  const [joinCode, setJoinCode] = useState("");
  const [sendingOnce, setSendingOnce] = useState(false);

  const [taskStatus, setTaskStatus] =
    useState<BackgroundTask.BackgroundTaskStatus | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  // -----------------------------------------------------
  // Load task info on screen focus/mount
  // -----------------------------------------------------
  useEffect(() => {
    refreshTaskInfo();
  }, []);

  const refreshTaskInfo = async () => {
    const info = await getChildLocationTaskInfo();
    setTaskStatus(info.status);
    setIsRegistered(info.isRegistered);
  };

  // -----------------------------------------------------
  // Send location manually once
  // -----------------------------------------------------
  const sendLocationOnce = async () => {
    try {
      setSendingOnce(true);

      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "Please login again.");
        return;
      }

      let fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") {
        Alert.alert("Permission", "Foreground permission required.");
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
        body: JSON.stringify({ childId, lat, lng }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Error", "Failed to send location.");
        return;
      }

      const now = new Date().toLocaleTimeString();
      setLastSent(now);

      Alert.alert("Success", "Location sent!");
    } finally {
      setSendingOnce(false);
    }
  };

  // -----------------------------------------------------
  // Start background location
  // -----------------------------------------------------
  const startBackground = async () => {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
      Alert.alert("Unavailable", "Background tasks not available.");
      return;
    }

    let fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== "granted") {
      Alert.alert("Permission", "Foreground permission needed.");
      return;
    }

    let bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== "granted") {
      Alert.alert("Permission", "Background location permission needed.");
      return;
    }

    await registerChildLocationTask();
    await refreshTaskInfo();

    Alert.alert(
      "Enabled",
      "Background sharing started.\nYour location will send periodically."
    );
  };

  // -----------------------------------------------------
  // Stop background location
  // -----------------------------------------------------
  const stopBackground = async () => {
    await unregisterChildLocationTask();
    await refreshTaskInfo();
    Alert.alert("Stopped", "Background sharing stopped.");
  };

  const toggleBackground = async () => {
    if (isRegistered) await stopBackground();
    else await startBackground();
  };

  // -----------------------------------------------------
  // Join Family
  // -----------------------------------------------------
  const joinFamily = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Error", "Enter valid family code.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "Login again.");

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
        Alert.alert("Error", "Invalid code.");
        return;
      }

      await SecureStore.setItemAsync("familyId", data.family._id);

      Alert.alert("Success", "Joined family!");
      setJoinCode("");
    } catch (e) {
      Alert.alert("Error", "Failed to join family.");
    }
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 20, flex: 1 }}>
        {/* HEADER */}
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

        {/* JOIN FAMILY */}
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
            placeholder="Enter Family Code"
            value={joinCode}
            onChangeText={setJoinCode}
            placeholderTextColor={COLORS.navy}
            style={{
              backgroundColor: COLORS.white,
              padding: 12,
              borderRadius: 10,
              marginTop: 12,
              borderWidth: 1,
              borderColor: COLORS.grey,
              color: COLORS.navy,
            }}
          />

          <TouchableOpacity
            onPress={joinFamily}
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

        {/* BACKGROUND STATUS CARD */}
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
            Service Status:{" "}
            {taskStatus !== null
              ? BackgroundTask.BackgroundTaskStatus[taskStatus]
              : "Unknown"}
          </Text>

          <Text style={{ color: COLORS.navy }}>
            Registered: {isRegistered ? "YES" : "NO"}
          </Text>

          {lastSent && (
            <Text style={{ color: COLORS.navy, marginTop: 6 }}>
              Last Manual Send: {lastSent}
            </Text>
          )}
        </View>

        {/* TOGGLE BACKGROUND */}
        <TouchableOpacity
          onPress={toggleBackground}
          style={{
            backgroundColor: isRegistered ? "#D9534F" : COLORS.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
            {isRegistered ? "Stop Background Sharing" : "Start Background Sharing"}
          </Text>
        </TouchableOpacity>

        {/* SEND ONCE */}
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
            <ActivityIndicator
              size="small"
              style={{ marginRight: 8 }}
              color={COLORS.white}
            />
          )}

          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
            Send Location Once
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
