/**
 * Team-Lizenzen wie v1 (SubscriptionPage/TeamLicensingManager): Jeder Berater bekommt eine
 * eigene Lizenz, abgerechnet pro Lizenz und Monat. Mengenrabatt ist in v1 derzeit 0 %.
 */
export const LICENSE_PRICE = 65;

export const LICENSES = { min: 5, max: 250, initial: 10 } as const;

/** Schnellwahl der Lizenzanzahl. */
export const LICENSE_PRESETS = [5, 10, 15, 30, 50] as const;

export function clampLicenses(value: number): number {
  if (!Number.isFinite(value)) return LICENSES.min;
  return Math.min(LICENSES.max, Math.max(LICENSES.min, Math.round(value)));
}

export function monthlyTotal(licenses: number): number {
  return licenses * LICENSE_PRICE;
}

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function formatEuro(value: number): string {
  return EURO.format(value);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Bereinigte, eindeutige Adressen der zugewiesenen Lizenzen; leere Plätze bleiben frei. */
export function assignedEmails(slots: readonly string[]): string[] {
  const cleaned = slots.map((slot) => slot.trim().toLowerCase()).filter((slot) => EMAIL.test(slot));
  return [...new Set(cleaned)];
}

/** Hält die Liste der Lizenz-Plätze so lang wie die gebuchte Anzahl, ohne Eingaben zu verlieren. */
export function resizeSlots(slots: readonly string[], licenses: number): string[] {
  return Array.from({ length: licenses }, (_, index) => slots[index] ?? "");
}
