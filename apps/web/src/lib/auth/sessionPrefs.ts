import { readPreference, writePreference } from "../preferences";

const REMEMBER_KEY = "rememberMe";
const TAB_SESSION_KEY = "vf_session";

/**
 * Wann nach dem Neuladen still wieder angemeldet wird, wie in v1:
 * mit "Angemeldet bleiben" immer, sonst nur im selben Browser-Tab (sessionStorage).
 */
export function shouldRestoreSession(): boolean {
  if (readPreference(REMEMBER_KEY) === "true") return true;
  try {
    return window.sessionStorage.getItem(TAB_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberSession(rememberMe: boolean): void {
  writePreference(REMEMBER_KEY, rememberMe ? "true" : null);
  try {
    window.sessionStorage.setItem(TAB_SESSION_KEY, "1");
  } catch {
    // ohne sessionStorage gilt die Anmeldung nur bis zum Neuladen
  }
}

export function forgetSession(): void {
  writePreference(REMEMBER_KEY, null);
  try {
    window.sessionStorage.removeItem(TAB_SESSION_KEY);
  } catch {
    // nichts zu entfernen
  }
}
