import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import io, { Socket } from "socket.io-client";

type LocationType = {
  lat: number;
  lng: number;
  ts: number;
};

export default function ParentLiveDashboard() {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io("http://168.231.123.52:4000");

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("listenToChild", "69199663f20f1f9df76b7518");
    });

    socket.on("locationUpdate", (data: LocationType) => {
      setLocation(data);
    });

    return () => {
      socket.off("connect");
      socket.off("locationUpdate");
      socket.disconnect(); // ✔ proper cleanup
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🚀 Parent Live Dashboard</Text>

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
            <Text style={styles.waitingText}>Waiting for updates…</Text>
          )}
        </View>

        <Text style={styles.footerText}>
          Updates arrive instantly whenever the child sends GPS data.
        </Text>
      </View>
    </SafeAreaView>
  );
}

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
