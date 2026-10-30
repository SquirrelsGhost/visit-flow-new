import type { UserSettings } from "./userSettings";

/**
 * Lädt die persönlichen Einstellungen als JSON herunter (v1 StorageSettings.handleExportSettings).
 * Wie in v1 nur eigene Einstellungen, keine Lauflisten, Termine oder Kundendaten.
 */
export function downloadSettings(settings: UserSettings, now = new Date()): string {
  const fileName = `visit-flow-settings-${now.toISOString().split("T")[0]}.json`;
  const payload = { settings, exportDate: now.toISOString(), exportType: "personal-settings" };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  return fileName;
}
