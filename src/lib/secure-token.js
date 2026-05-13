import { Capacitor } from "@capacitor/core";

const TOKEN_KEY = "base44_access_token";
let SecureStoragePlugin = null;

async function getPlugin() {
  if (SecureStoragePlugin) return SecureStoragePlugin;
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const mod = await import("capacitor-secure-storage-plugin");
    SecureStoragePlugin = mod.SecureStoragePlugin;
    return SecureStoragePlugin;
  } catch {
    return null;
  }
}

export async function mirrorTokenToKeychain() {
  const plugin = await getPlugin();
  if (!plugin) return;
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      await plugin.set({ key: TOKEN_KEY, value: token });
    } catch {}
  }
}

export async function restoreTokenFromKeychain() {
  const plugin = await getPlugin();
  if (!plugin) return;
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) return;
  try {
    const { value } = await plugin.get({ key: TOKEN_KEY });
    if (value) localStorage.setItem(TOKEN_KEY, value);
  } catch {}
}

export async function clearKeychainToken() {
  const plugin = await getPlugin();
  if (!plugin) return;
  try {
    await plugin.remove({ key: TOKEN_KEY });
  } catch {}
}
