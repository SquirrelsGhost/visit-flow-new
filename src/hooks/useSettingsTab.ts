import { useCallback, useState, useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS_TAB, isSettingsTab, SETTINGS_TAB_STORAGE_KEY, type SettingsTab } from "../lib/settings/settingsTabs";

const noSubscription = () => () => {};

function readSavedTab(): SettingsTab | null {
  try {
    const saved = window.sessionStorage.getItem(SETTINGS_TAB_STORAGE_KEY);
    return isSettingsTab(saved) ? saved : null;
  } catch {
    return null;
  }
}

/** Aktiver Reiter der Einstellungen; merkt sich die Wahl im sessionStorage wie v1. Auf dem Server gilt der Standard-Reiter. */
export function useSettingsTab(): [SettingsTab, (tab: SettingsTab) => void] {
  const saved = useSyncExternalStore(noSubscription, readSavedTab, () => null);
  const [picked, setPicked] = useState<SettingsTab | null>(null);

  const setTab = useCallback((next: SettingsTab) => {
    setPicked(next);
    try {
      window.sessionStorage.setItem(SETTINGS_TAB_STORAGE_KEY, next);
    } catch {
      // Auswahl gilt dann nur bis zum Neuladen
    }
  }, []);

  return [picked ?? saved ?? DEFAULT_SETTINGS_TAB, setTab];
}
