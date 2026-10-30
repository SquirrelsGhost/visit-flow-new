import { useCallback, useSyncExternalStore } from "react";
import { readPreference, writePreference } from "../lib/preferences";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Ein Ein/Aus-Schalter in localStorage ("1"/"0" wie v1), über Neuladen und Komponenten hinweg gleich. */
export function useStoredFlag(key: string): [boolean, () => void] {
  const value = useSyncExternalStore(subscribe, () => readPreference(key) === "1", () => false);
  const toggle = useCallback(() => {
    writePreference(key, readPreference(key) === "1" ? "0" : "1");
    listeners.forEach((listener) => listener());
  }, [key]);
  return [value, toggle];
}
