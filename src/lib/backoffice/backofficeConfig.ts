/**
 * Team-Backoffice als Zusatzprodukt (Add-on) für Teamleiter. Noch ohne echte Bezahlung: freigeschaltet ist es,
 * wenn v1 GET /subscriptions/current das Add-on in `addons` meldet (wie v1 "ai-coach").
 */
export const BACKOFFICE_PLAN_ID = "team-backoffice";

/**
 * Preis nur als Konfiguration, noch nicht final (Emre 2026-10-24: "100 euro mntl oder 50").
 * Richtpreis je Team und Monat, unabhängig von der Teamgröße.
 */
export const BACKOFFICE_PRICE = {
  monthly: 79,
  final: false,
  range: "50–100 €",
} as const;

/**
 * ANNAHME (offen, mit Emre klären): Teamleiter sehen Kundenname und volle Adresse ihres Teams, weil sie
 * Verkäufe sonst nicht prüfen können. "street" zeigt nur Straße und Ort ohne Hausnummer, "none" blendet sie aus.
 */
export type AddressView = "full" | "street" | "none";
export const BACKOFFICE_ADDRESS_VIEW: AddressView = "full";

/**
 * ANNAHME: Teamleiter dürfen bestätigen, stornieren und löschen, aber keine Produkte bearbeiten
 * (Tarif, Provision). Bestätigen geht sofort, ohne die 14-Tage-Frist der Berater.
 */
export const BACKOFFICE_CAN_DELETE = true;

/** Wie weit die Liste zurückreicht: laufender Monat und die zwei davor (offene Verkäufe sind selten älter). */
export const BACKOFFICE_MONTHS_BACK = 2;

/** Freischaltung ohne Bezahlung: "Freischalten anfragen" öffnet eine E-Mail an den Support (Adresse wie in v1). */
export const BACKOFFICE_CONTACT = "support@visit-flow.com";
