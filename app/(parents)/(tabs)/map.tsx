import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import io from "socket.io-client";

export default function ParentLiveDashboard() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    ts: number;
  } | null>(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io("http://168.231.123.52:4000");

    socket.on("connect", () => {
      setConnected(true);

      // IMPORTANT: you must pass childId here 
      socket.emit("listenToChild", "69199663f20f1f9df76b7518");
    });

    socket.on("locationUpdate", (data) => {
      setLocation(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        
        {/* Header */}
        <Text style={styles.title}>🚀 Parent Live Dashboard</Text>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusBadge,
              connected ? styles.connected : styles.disconnected,
            ]}
          >
            {connected ? "🟢 Connected to Server" : "🔴 Connecting..."}
          </Text>
        </View>

        {/* Location Card */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>📍 Live Child Location</Text>

          {location ? (
            <>
              <Text style={styles.dataText}>
                <Text style={styles.label}>Latitude: </Text>
                {location.lat}
              </Text>

              <Text style={styles.dataText}>
                <Text style={styles.label}>Longitude: </Text>
                {location.lng}
              </Text>

              <Text style={styles.timestamp}>
                ⏱ Updated: {new Date(location.ts).toLocaleTimeString()}
              </Text>
            </>
          ) : (
            <Text style={styles.waitingText}>Waiting for location updates…</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          This dashboard updates instantly whenever the child sends new GPS data.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// --------------------------------------------------------
// 🎨 STYLES
// --------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f19",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(18, 24, 38, 0.85)",
    padding: 20,
    borderRadius: 20,
    borderColor: "#2d3447",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    fontSize: 14,
    fontWeight: "600",
    borderWidth: 1,
  },
  connected: {
    backgroundColor: "rgba(40, 167, 69, 0.2)",
    borderColor: "#28a745",
    color: "#28a745",
  },
  disconnected: {
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    borderColor: "#dc3545",
    color: "#dc3545",
  },
  locationCard: {
    backgroundColor: "rgba(33, 41, 57, 0.7)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#323b52",
  },
  sectionTitle: {
    color: "#cfd6e6",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  dataText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },
  label: {
    color: "#9bb0d1",
    fontWeight: "600",
  },
  timestamp: {
    marginTop: 8,
    color: "#9bb0d1",
    fontSize: 13,
  },
  waitingText: {
    color: "#7a8ca7",
    fontSize: 15,
    textAlign: "center",
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    color: "#6d7a93",
    fontSize: 13,
  },
});
