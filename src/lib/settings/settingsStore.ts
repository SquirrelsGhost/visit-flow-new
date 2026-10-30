import { hasDemoSession } from "../auth/demoSession";
import { readPreference, writePreference } from "../preferences";
import { DEMO_SETTINGS } from "./settingsDemoData";
import { DEFAULT_SETTINGS, parseSettings, type UserSettings } from "./userSettings";

/** Eigener Schlüssel für die Demo, damit Beispieldaten nie in echten Einstellungen landen. */
const KEY = "vf_settings";
const DEMO_KEY = "vf_settings_demo";
/** Meldet Änderungen im selben Tab; "storage" feuert nur in anderen Tabs. */
const CHANGE_EVENT = "vf:settings-change";

const storageKey = () => (hasDemoSession() ? DEMO_KEY : KEY);

let cachedSource: string | undefined;
let cached: UserSettings = DEFAULT_SETTINGS;

/**
 * Liest die Einstellungen (v1: SettingsProvider, dort in der User-Cloud). Bis die v2-API sie speichert,
 * liegen sie auf diesem Gerät. Gleicher Rohwert liefert dasselbe Objekt, wie useSyncExternalStore es braucht.
 */
export function readSettings(): UserSettings {
  const key = storageKey();
  const raw = readPreference(key);
  const source = `${key}:${raw}`;
  if (source === cachedSource) return cached;
  cachedSource = source;
  if (raw === null) {
    cached = hasDemoSession() ? DEMO_SETTINGS : DEFAULT_SETTINGS;
    return cached;
  }
  try {
    cached = parseSettings(JSON.parse(raw));
  } catch {
    cached = DEFAULT_SETTINGS;
  }
  return cached;
}

/** Ändert einzelne Werte und meldet es allen Ansichten. */
export function updateSettings(patch: Partial<UserSettings>): UserSettings {
  const next = { ...readSettings(), ...patch };
  writePreference(storageKey(), JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}

export function subscribeSettings(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
