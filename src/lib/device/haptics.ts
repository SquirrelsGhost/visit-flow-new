import { getFeedbackPrefs } from "../feedback/feedbackPrefs";

/** Muster in ms (Vibrieren, Pause, Vibrieren …). light/medium/heavy wie v1 (FormField). */
const PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [12, 60, 18],
  warning: [24, 70, 24],
  error: [30, 50, 30, 50, 30],
  celebrate: [16, 50, 16, 50, 40],
} as const;

export type HapticType = keyof typeof PATTERNS;

/** Stärke für das native Capacitor-Plugin, falls die App als native Hülle läuft. */
const NATIVE_IMPACT: Record<HapticType, "LIGHT" | "MEDIUM" | "HEAVY"> = {
  light: "LIGHT",
  medium: "MEDIUM",
  heavy: "HEAVY",
  success: "MEDIUM",
  warning: "MEDIUM",
  error: "HEAVY",
  celebrate: "HEAVY",
};

interface NativeHaptics {
  impact: (options: { style: string }) => Promise<void>;
}
interface CapacitorWindow {
  Capacitor?: { isNativePlatform?: () => boolean; Plugins?: { Haptics?: NativeHaptics } };
}

/**
 * Kurzes Vibrieren auf dem Handy. In der nativen App über das Capacitor-Haptics-Plugin (wenn eingebaut),
 * sonst navigator.vibrate (Android). iPhone im Browser kann nicht vibrieren, dann passiert nichts.
 * Respektiert den Schalter "Haptik" in den Einstellungen.
 */
export function hapticFeedback(type: HapticType = "light"): void {
  if (typeof window === "undefined" || !getFeedbackPrefs().haptics) return;
  const cap = (window as CapacitorWindow).Capacitor;
  const native = cap?.isNativePlatform?.() ? cap.Plugins?.Haptics : undefined;
  if (native) {
    void native.impact({ style: NATIVE_IMPACT[type] }).catch(() => undefined);
    return;
  }
  if ("vibrate" in navigator) navigator.vibrate([...PATTERNS[type]]);
}
