/**
 * Datenmodell des Fahrtenbuchs. Grundlage ist v1 (services/fahrtenbuch/FahrtenbuchService.ts: Tag mit Stopps,
 * Kilometerstand Beginn/Ende, Uhrzeiten, Fahrer, Zweck, Geschäftspartner). v2 erfasst statt eines Tages
 * einzelne Fahrten, weil das Finanzamt je Fahrt Datum, Kilometerstand, Ziel, Zweck und Partner verlangt.
 */

/** Geschäftlich, privat oder Fahrt zwischen Wohnung und erster Tätigkeitsstätte. */
export type TripKind = "business" | "private" | "commute";
export const TRIP_KINDS: readonly TripKind[] = ["business", "private", "commute"];

/** Woher die Fahrt kommt: von Hand, aus dem alten Fahrtenbuch (v1) oder aus einer Lücke nachgetragen. */
export type TripSource = "manual" | "v1" | "gap";

/** Was eine Fahrt fachlich ausmacht; ohne Verwaltungsfelder. */
export interface TripFields {
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm */
  startTime: string;
  endTime: string;
  startKm: number;
  endKm: number;
  kind: TripKind;
  /** Startort */
  from: string;
  /** Reiseziel (Ort, Gebiet, Straßen) */
  to: string;
  /** Reisezweck */
  purpose: string;
  /** Aufgesuchte Geschäftspartner (bei D2D: Haushalte, Firma, Team) */
  partner: string;
  /** Begründung bei Umweg */
  detour: string;
  vehicleId: string;
}

/** Frühere Fassung einer Fahrt: Änderungen bleiben sichtbar, wie es ein elektronisches Fahrtenbuch braucht. */
export interface TripRevision {
  at: string;
  before: TripFields;
}

export interface Trip extends TripFields {
  id: string;
  driver: string;
  source: TripSource;
  createdAt: string;
  updatedAt?: string;
  revisions: TripRevision[];
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
}

/** Abgeschlossener Monat ("yyyy-MM"); jedes Wiederöffnen wird mit Grund vermerkt. */
export interface MonthLock {
  /** null = wieder geöffnet; der Eintrag bleibt für das Protokoll. */
  lockedAt: string | null;
  reopened: { at: string; reason: string }[];
}

export interface LogbookData {
  version: 1;
  vehicles: Vehicle[];
  activeVehicleId: string;
  trips: Trip[];
  /** Je Monat ("yyyy-MM") Abschluss und Wiederöffnungen. */
  locks: Record<string, MonthLock>;
  /** v1-Verlauf wurde schon einmal übernommen. */
  importedV1: boolean;
}

/** Monat wie in der Abrechnung: month 0–11. */
export interface MonthRef {
  month: number;
  year: number;
}

export interface KindTotals {
  business: number;
  private: number;
  commute: number;
}

export interface MonthSummary {
  totalKm: number;
  byKind: KindTotals;
  trips: number;
  days: number;
  /** Anteil geschäftlicher Kilometer 0–1. */
  businessShare: number;
  /** Geschäftliche km × Kilometerpauschale. */
  allowance: number;
}

/** Hinweis des Finanzamt-Checks. */
export type CheckKind = "gap" | "overlap" | "missing" | "late" | "unlocked";
export interface LogbookIssue {
  kind: CheckKind;
  /** Betroffene Fahrt (bei Lücke: die Fahrt nach der Lücke). */
  tripId?: string;
  date: string;
  /** Lücke/Überschneidung in km, fehlende Felder als Liste. */
  km?: number;
  fields?: (keyof TripFields)[];
  /** Für die Lücke: Kilometerstand davor und danach. */
  fromKm?: number;
  toKm?: number;
  /** Tag und Uhrzeit der Fahrt vor der Lücke; dort wird eine nachgetragene Fahrt eingereiht. */
  afterDate?: string;
  afterTime?: string;
}

/** Kilometerpauschale für Dienstreisen mit dem eigenen Pkw (§ 9 Abs. 1 Nr. 4a EStG): 0,30 € je km. */
export const KM_RATE = 0.3;
/** Nach so vielen Tagen gilt eine Fahrt als nicht mehr zeitnah erfasst. */
export const LATE_AFTER_DAYS = 7;
/** Höchste plausible Strecke einer einzelnen Fahrt. */
export const MAX_TRIP_KM = 2000;
