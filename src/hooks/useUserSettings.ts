import { useSyncExternalStore } from "react";
import { readSettings, subscribeSettings, updateSettings } from "../lib/settings/settingsStore";
import { DEFAULT_SETTINGS, type UserSettings } from "../lib/settings/userSettings";

export interface UserSettingsState {
  settings: UserSettings;
  update: (patch: Partial<UserSettings>) => void;
}

/** Einstellungen des Benutzers (v1 useSettings). Alle Ansichten ziehen bei einer Änderung sofort nach. */
export function useUserSettings(): UserSettingsState {
  const settings = useSyncExternalStore(subscribeSettings, readSettings, () => DEFAULT_SETTINGS);
  return { settings, update: updateSettings };
}
