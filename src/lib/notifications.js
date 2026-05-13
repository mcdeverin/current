import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";

const isNative = Capacitor.isNativePlatform();

export async function registerPushNotifications() {
  if (!isNative) return;
  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive === "granted") {
      await PushNotifications.register();
    }
  } catch (err) {
    console.error("Push registration failed:", err);
  }
}

export async function scheduleDailyReminder(timeStr = "08:00") {
  if (!isNative) return;
  try {
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== "granted") return;

    // Cancel existing daily reminder first
    const pending = await LocalNotifications.getPending();
    const existing = pending.notifications.filter(n => n.id === 1001);
    if (existing.length > 0) {
      await LocalNotifications.cancel({ notifications: existing });
    }

    const [hours, minutes] = timeStr.split(":").map(Number);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: "Current",
          body: "Take a moment. How are you today?",
          schedule: {
            on: { hour: hours, minute: minutes },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: "default",
        },
      ],
    });
  } catch (err) {
    console.error("Daily reminder scheduling failed:", err);
  }
}

export async function cancelDailyReminder() {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
  } catch {}
}
