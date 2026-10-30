import type { UserSettings } from "./userSettings";

/** Beispielwerte für den Demo-Modus: so sieht ein eingerichteter Berater aus. */
export const DEMO_SETTINGS: UserSettings = {
  notificationLeadMinutes: 15,
  pushNotifications: false,
  soundNotifications: true,
  autoKmTracking: true,
  showAiAssistant: true,
  biometricAuth: false,
  homeAddress: {
    street: "Friedrichstraße",
    houseNumber: "123",
    zipCode: "10117",
    city: "Berlin",
    latitude: 52.5163,
    longitude: 13.3889,
  },
  currentKm: 48230,
  emailReport: { enabled: true, time: "18:00" },
};

/** Belegter Cloud-Speicher im Demo-Modus (v1 CloudStorageService.getStats). */
export const DEMO_STORAGE = { used: 18.6 * 1024 * 1024, total: 100 * 1024 * 1024 } as const;

/** So lange "arbeitet" der Demo-Sync, damit die Animation sichtbar ist. */
export const DEMO_DELAY_MS = 900;
