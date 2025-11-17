// tasks/childLocationTask.ts
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";

export const CHILD_LOCATION_TASK = "child-location-task";

TaskManager.defineTask(CHILD_LOCATION_TASK, async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    const childId = "69199663f20f1f9df76b7518"; // your default

    if (!token) {
      console.log("❌ No token in background.");
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const res = await fetch("http://168.231.123.52:4000/api/location/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ childId, lat, lng }),
    });

    const data = await res.json();
    if (!data.success) {
      console.log("❌ Background update failed");
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    console.log("📍 Background location sent:", lat, lng);

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.log("❌ Task error:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerChildLocationTask() {
  return BackgroundTask.registerTaskAsync(CHILD_LOCATION_TASK);
}

export async function unregisterChildLocationTask() {
  return BackgroundTask.unregisterTaskAsync(CHILD_LOCATION_TASK);
}

export async function getChildLocationTaskInfo() {
  const status = await BackgroundTask.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    CHILD_LOCATION_TASK
  );
  return { status, isRegistered };
}
