/**
 * Lokale Einstellungen (Sprache, Theme, "Angemeldet bleiben").
 * Im privaten Modus kann localStorage werfen, dann gelten die Standardwerte.
 */
export function readPreference(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writePreference(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Einstellung gilt dann nur bis zum Neuladen
  }
}
