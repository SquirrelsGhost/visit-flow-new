import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export type PositionResult =
  | { ok: true; latitude: number; longitude: number; accuracy: number | null }
  | { ok: false; reason: "denied" | "unsupported" | "failed" };

const OPTIONS = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

/** Einmalige, genaue GPS-Position: in der App über Capacitor, im Browser über navigator.geolocation. */
export async function currentPosition(): Promise<PositionResult> {
  try {
    if (Capacitor.isNativePlatform()) {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== "granted" && (await Geolocation.requestPermissions()).location !== "granted") {
        return { ok: false, reason: "denied" };
      }
      const { coords } = await Geolocation.getCurrentPosition(OPTIONS);
      return { ok: true, latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy ?? null };
    }
    if (!("geolocation" in navigator)) return { ok: false, reason: "unsupported" };
    const { coords } = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, OPTIONS),
    );
    return { ok: true, latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy ?? null };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
