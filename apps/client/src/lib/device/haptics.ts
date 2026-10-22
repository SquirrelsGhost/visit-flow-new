const PATTERNS = { light: [10], medium: [20], heavy: [30] } as const;

/** Kurzes Vibrieren auf dem Handy wie in v1 (FormField). Ohne Unterstützung passiert nichts. */
export function hapticFeedback(type: keyof typeof PATTERNS = "light"): void {
  if ("vibrate" in navigator) navigator.vibrate([...PATTERNS[type]]);
}
