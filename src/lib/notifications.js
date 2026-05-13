import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();
const dynImport = (p) => (new Function('p', 'return import(p)'))(p);

async function getPush() {
  const mod = await dynImport("@capacitor/push-notifications");
  return mod.PushNotifications;
}

async function getLocal() {
  const mod = await dynImport("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

export async function registerPushNotifications() {
  if (!isNative) return;
  try {
    const PushNotifications = await getPush();
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
    const LocalNotifications = await getLocal();
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== "granted") return;

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
    const LocalNotifications = await getLocal();
    await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
  } catch {}
}