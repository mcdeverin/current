import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

export const setStatusBarDark = async () => {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {}
};

export const setStatusBarLight = async () => {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {}
};
