import { hasDemoSession } from "../auth/demoSession";
import { readPreference, writePreference } from "../preferences";
import { demoLogbook } from "./logbookDemoData";
import { emptyLogbook, parseLogbook } from "./logbookSchema";
import type { LogbookData } from "./logbookTypes";

/** Je Nutzer ein eigener Schlüssel, damit sich auf einem geteilten Gerät nichts vermischt. */
const keyOf = (userId: string) => `vf_logbook_${userId}`;
/** Die Demo lebt nur im Tab und fängt mit Beispielfahrten an. */
const DEMO_KEY = "vf_logbook_demo";
const CHANGE_EVENT = "vf:logbook-change";

let cachedSource: string | undefined;
let cached: LogbookData = emptyLogbook();

function readRaw(userId: string): { key: string; raw: string | null } {
  if (hasDemoSession()) {
    try {
      return { key: DEMO_KEY, raw: window.sessionStorage.getItem(DEMO_KEY) };
    } catch {
      return { key: DEMO_KEY, raw: null };
    }
  }
  const key = keyOf(userId);
  return { key, raw: readPreference(key) };
}

/**
 * Liest das Fahrtenbuch. Wie in v1 liegt es bis zur v2-API auf diesem Gerät (v1: localStorage
 * "visit-flow-fahrtenbuch-history"). Gleicher Rohwert liefert dasselbe Objekt für useSyncExternalStore.
 */
export function readLogbook(userId: string): LogbookData {
  const { key, raw } = readRaw(userId);
  const source = `${key}:${raw}`;
  if (source === cachedSource) return cached;
  cachedSource = source;
  if (raw === null) {
    cached = hasDemoSession() ? demoLogbook() : emptyLogbook();
    return cached;
  }
  try {
    cached = parseLogbook(JSON.parse(raw));
  } catch {
    cached = emptyLogbook();
  }
  return cached;
}

export function writeLogbook(userId: string, data: LogbookData): void {
  const value = JSON.stringify(data);
  if (hasDemoSession()) {
    try {
      window.sessionStorage.setItem(DEMO_KEY, value);
    } catch {
      // ohne Speicher gilt die Demo nur bis zum Neuladen
    }
  } else {
    writePreference(keyOf(userId), value);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeLogbook(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function resetDemoLogbook(): void {
  try {
    window.sessionStorage.removeItem(DEMO_KEY);
  } catch {
    // nichts zu tun
  }
  cachedSource = undefined;
}
