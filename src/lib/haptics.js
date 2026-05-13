import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

export const hapticLight = () => {
  if (isNative) Haptics.impact({ style: ImpactStyle.Light });
};

export const hapticMedium = () => {
  if (isNative) Haptics.impact({ style: ImpactStyle.Medium });
};

export const hapticHeavy = () => {
  if (isNative) Haptics.impact({ style: ImpactStyle.Heavy });
};

export const hapticSuccess = () => {
  if (isNative) Haptics.notification({ type: NotificationType.Success });
};

export const hapticWarning = () => {
  if (isNative) Haptics.notification({ type: NotificationType.Warning });
};
