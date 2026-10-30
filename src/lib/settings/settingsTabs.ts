import type { TranslationKey } from "../../texts/i18n/de";

/** Reiter der Einstellungen in der Reihenfolge von v1 (SettingsPage.tsx). */
export const SETTINGS_TABS = ["personal", "app", "security", "storage"] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const SETTINGS_TAB_LABELS: Record<SettingsTab, TranslationKey> = {
  personal: "settings.tabPersonal",
  app: "settings.tabApp",
  security: "settings.tabSecurity",
  storage: "settings.tabStorage",
};

/** Wie v1 startet die Seite mit "Persönlich". */
export const DEFAULT_SETTINGS_TAB: SettingsTab = "personal";

/** Wie v1: der zuletzt gewählte Reiter bleibt für die Sitzung im Tab gespeichert. */
export const SETTINGS_TAB_STORAGE_KEY = "settings_active_tab";

export function isSettingsTab(value: unknown): value is SettingsTab {
  return typeof value === "string" && (SETTINGS_TABS as readonly string[]).includes(value);
}

/** Nachbar-Reiter für Wischgesten; null am Rand. */
export function neighborTab(tab: SettingsTab, step: 1 | -1): SettingsTab | null {
  return SETTINGS_TABS[SETTINGS_TABS.indexOf(tab) + step] ?? null;
}

/** Merkt einen Reiter vor, damit /settings direkt dort öffnet (Links aus dem Profil). */
export function preselectSettingsTab(tab: SettingsTab): void {
  try {
    window.sessionStorage.setItem(SETTINGS_TAB_STORAGE_KEY, tab);
  } catch {
    // ohne sessionStorage öffnet die Seite auf dem Standard-Reiter
  }
}
