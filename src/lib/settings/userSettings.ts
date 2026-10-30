import { z } from "zod";

/** Hausadresse für Routenplanung und Kilometer (v1 SettingsProvider.homeAddress). */
const homeAddressSchema = z.object({
  street: z.string(),
  houseNumber: z.string(),
  zipCode: z.string(),
  city: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/** Täglicher E-Mail-Bericht für Admin und Teamleiter (v1 /api/settings/email-notifications). */
const emailReportSchema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

/**
 * Die Einstellungen aus v1 (context/settings/SettingsProvider.tsx), die die vier Reiter bedienen.
 * Unbekannte oder kaputte Werte fallen beim Lesen auf den Standard zurück.
 */
export const userSettingsSchema = z.object({
  notificationLeadMinutes: z.number().int().min(0).catch(15),
  pushNotifications: z.boolean().catch(true),
  soundNotifications: z.boolean().catch(true),
  autoKmTracking: z.boolean().catch(true),
  showAiAssistant: z.boolean().catch(true),
  biometricAuth: z.boolean().catch(false),
  homeAddress: homeAddressSchema.optional().catch(undefined),
  currentKm: z.number().int().min(0).optional().catch(undefined),
  emailReport: emailReportSchema.catch({ enabled: false, time: "18:00" }),
  /** Eigene Belegung der vier Plätze der unteren Leiste (Ziel-Id oder null = Standard). */
  bottomNavSlots: z.array(z.string().nullable()).max(4).optional().catch(undefined),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type HomeAddress = z.infer<typeof homeAddressSchema>;
export type EmailReport = z.infer<typeof emailReportSchema>;

/** Standardwerte wie v1 (defaultSettings). */
export const DEFAULT_SETTINGS: UserSettings = {
  notificationLeadMinutes: 15,
  pushNotifications: true,
  soundNotifications: true,
  autoKmTracking: true,
  showAiAssistant: true,
  biometricAuth: false,
  emailReport: { enabled: false, time: "18:00" },
};

/** Vorlaufzeiten der Termin-Erinnerung in Minuten, 0 = aus (v1 AppSettings). */
export const LEAD_MINUTES = [0, 5, 10, 15, 30] as const;

/** Uhrzeiten für den E-Mail-Bericht im Halbstundentakt (v1: 48 Einträge). */
export const REPORT_TIMES: readonly string[] = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0");
  return `${hours}:${i % 2 === 0 ? "00" : "30"}`;
});

export function parseSettings(value: unknown): UserSettings {
  const parsed = userSettingsSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

export function formatAddress(address: HomeAddress): string {
  return `${address.street} ${address.houseNumber}, ${address.zipCode} ${address.city}`;
}
