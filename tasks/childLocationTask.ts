import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

export const CHILD_LOCATION_TASK = "child-location-task";

const API_BASE = "http://168.231.123.52:4000";

// 🔥 FIXED CHILD ID — NEVER CHANGES
const FIXED_CHILD_ID = "69199663f20f1f9df76b7518";

// --------------------------------------------
// BACKGROUND LOCATION TASK
// --------------------------------------------
TaskManager.defineTask(CHILD_LOCATION_TASK, async ({ data, error }: any) => {
  try {
    if (error) {
      console.log("❌ Background task error:", error);
      return;
    }

    if (!data?.locations?.length) {
      console.log("⚠️ No location data provided");
      return;
    }

    const { latitude: lat, longitude: lng } = data.locations[0].coords;

    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.log("❌ No token found in background mode");
      return;
    }

    const res = await fetch(`${API_BASE}/api/location/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        childId: FIXED_CHILD_ID, // 🔥 ALWAYS FIXED
        lat,
        lng,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      console.log("❌ Background send failed:", json);
      return;
    }

    console.log("📍 BG Sent:", lat, lng);
  } catch (err) {
    console.log("❌ Background exception:", err);
  }
});

// --------------------------------------------
// START LOCATION UPDATES
// --------------------------------------------
export async function startChildLocationUpdates() {
  const already = await Location.hasStartedLocationUpdatesAsync(CHILD_LOCATION_TASK);
  if (already) {
    console.log("ℹ️ BG already running");
    return;
  }

  await Location.startLocationUpdatesAsync(CHILD_LOCATION_TASK, {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 300000, // 5 minutes (300,000 ms)
    distanceInterval: 5, // 5 meters
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: "FamLink",
      notificationBody: "Sharing live location in background...",
    },
  });

  console.log("🚀 Background location started");
}

// --------------------------------------------
// STOP LOCATION UPDATES
// --------------------------------------------
export async function stopChildLocationUpdates() {
  const started = await Location.hasStartedLocationUpdatesAsync(CHILD_LOCATION_TASK);

  if (started) {
    await Location.stopLocationUpdatesAsync(CHILD_LOCATION_TASK);
    console.log("🛑 Background location stopped");
  }
}

// --------------------------------------------
// STATUS CHECK
// --------------------------------------------
export async function isChildLocationTaskRunning(): Promise<boolean> {
  return await Location.hasStartedLocationUpdatesAsync(CHILD_LOCATION_TASK);
}

// --------------------------------------------
// CHECK AND RESTART LOCATION TASK IF NEEDED
// --------------------------------------------
export async function checkAndRestartLocationUpdates() {
  const isRunning = await isChildLocationTaskRunning();
  if (!isRunning) {
    await startChildLocationUpdates();
  }
}

// Call this function every 30 minutes or as needed
setInterval(checkAndRestartLocationUpdates, 20 * 60 * 1000); // 20 minutes
