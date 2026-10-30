import { useSyncExternalStore } from "react";
import type { Vertical } from "../lib/battle/battleCategories";
import { readPreference, writePreference } from "../lib/preferences";

const KEY = "activeVertical";
/** Meldet einen Wechsel im selben Tab; "storage" feuert nur in anderen Tabs. */
const CHANGE_EVENT = "vf:vertical-change";
const isVertical = (v: string | null): v is Vertical => v === "telco" || v === "solar" || v === "energy";

const read = (): Vertical => {
  const value = readPreference(KEY);
  return isVertical(value) ? value : "telco";
};

/** Wechselt den Bereich (v1: updateSettings({ activeVertical })). Alle Ansichten mit useVertical ziehen sofort nach. */
export function setVertical(vertical: Vertical): void {
  writePreference(KEY, vertical);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Aktiver Bereich der App (v1: settings.activeVertical). Bis die Einstellungen portiert sind,
 * gilt Telco, außer es ist lokal schon ein anderer Bereich gespeichert.
 */
export function useVertical(): Vertical {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CHANGE_EVENT, onChange);
      };
    },
    read,
    () => "telco",
  );
}
