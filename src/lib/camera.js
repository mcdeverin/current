import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const isNative = Capacitor.isNativePlatform();

export async function takeProfilePhoto() {
  if (!isNative) return null;
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      width: 400,
      height: 400,
    });
    return image.dataUrl;
  } catch {
    return null;
  }
}

export async function captureForSharing() {
  if (!isNative) return null;
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    return image.dataUrl;
  } catch {
    return null;
  }
}
