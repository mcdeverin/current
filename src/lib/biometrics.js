import { Capacitor } from "@capacitor/core";

let BiometricAuth = null;

async function getPlugin() {
  if (BiometricAuth) return BiometricAuth;
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const mod = await import("@aparajita/capacitor-biometric-auth");
    BiometricAuth = mod.BiometricAuth;
    return BiometricAuth;
  } catch {
    return null;
  }
}

export async function isBiometricAvailable() {
  const plugin = await getPlugin();
  if (!plugin) return false;
  try {
    const result = await plugin.checkBiometry();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export async function authenticateWithBiometrics(reason = "Verify your identity") {
  const plugin = await getPlugin();
  if (!plugin) return true; // Allow through on web
  try {
    await plugin.authenticate({ reason, allowDeviceCredential: true });
    return true;
  } catch {
    return false;
  }
}
