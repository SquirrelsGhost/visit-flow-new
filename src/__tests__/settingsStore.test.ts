import { beforeEach, describe, expect, it, vi } from "vitest";

let demo = false;
vi.mock("../lib/auth/demoSession", () => ({ hasDemoSession: () => demo }));

const { readSettings, updateSettings } = await import("../lib/settings/settingsStore");
const { DEMO_SETTINGS } = await import("../lib/settings/settingsDemoData");
const { DEFAULT_SETTINGS } = await import("../lib/settings/userSettings");
const { formatBytes } = await import("../lib/settings/storageUsage");

describe("Einstellungsspeicher", () => {
  beforeEach(() => {
    demo = false;
  });

  it("liefert ohne gespeicherte Werte die v1-Standardwerte", () => {
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("füllt die Demo mit Beispieldaten und hält sie getrennt von echten Einstellungen", () => {
    demo = true;
    expect(readSettings().homeAddress?.city).toBe("Berlin");
    updateSettings({ currentKm: 50000 });
    expect(readSettings()).toEqual({ ...DEMO_SETTINGS, currentKm: 50000 });
    expect(window.localStorage.getItem("vf_settings")).toBeNull();
    demo = false;
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("ersetzt kaputte oder fehlende Werte durch den Standard", () => {
    window.localStorage.setItem("vf_settings", JSON.stringify({ notificationLeadMinutes: "viel", soundNotifications: false }));
    expect(readSettings()).toEqual({ ...DEFAULT_SETTINGS, soundNotifications: false });
    window.localStorage.setItem("vf_settings", "{kein json");
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("formatiert Speichergrößen wie v1", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(18.6 * 1024 * 1024)).toBe("18,6 MB");
  });
});
