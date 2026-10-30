import type { Vertical } from "../battle/battleCategories";
import type { DraftHouse, VisitDetails, VisitStatus } from "./mapTypes";

/** Welcher Dialog-Schritt nach dem Status-Tipp beim neuen Haus kommt (v1 openStatusDialog). */
export type VisitStep = "appointment" | "supplied" | "nointerest" | "nothome" | "sale";

export function stepForStatus(status: VisitStatus, vertical: Vertical): VisitStep | null {
  switch (status) {
    case "Angetroffen → Termin":
      return "appointment";
    case "Angetroffen → Sale":
      return "sale";
    // Solar: "Unpassend" ist ein Tap ohne Dialog (v1 handleUnpassend)
    case "Angetroffen → Versorgt":
      return vertical === "solar" ? null : "supplied";
    case "Angetroffen → Kein Interesse":
      return "nointerest";
    case "N/A":
      return "nothome";
    default:
      return null;
  }
}

/** v1 prüft vor jedem Dialog die Adresse, sonst kann der Server sie nicht anlegen. */
export function draftAddressError(draft: DraftHouse): string | null {
  if (!draft.street.trim()) return "Straße ist erforderlich";
  if (!draft.houseNumber.trim()) return "Hausnummer ist erforderlich";
  if (!draft.zipCode.trim()) return "Postleitzahl ist erforderlich";
  if (!draft.city.trim()) return "Ort ist erforderlich";
  return null;
}

export interface Choice {
  id: string;
  label: string;
  icon?: string;
}

export function noInterestReasons(vertical: Vertical): Choice[] {
  const common = [
    { id: "expensive", label: "Zu teuer", icon: "💰" },
    { id: "not-interested", label: "Nicht interessiert", icon: "🚫" },
  ];
  if (vertical === "solar") {
    return [
      ...common,
      { id: "already-has-pv", label: "Hat bereits PV", icon: "☀️" },
      { id: "tenant", label: "Mieter / kein Eigentümer", icon: "🔑" },
      { id: "roof-unsuitable", label: "Dach ungeeignet", icon: "🏠" },
      { id: "other", label: "Sonstiges", icon: "❓" },
    ];
  }
  return [
    ...common,
    { id: "already-customer", label: "Bereits Kunde", icon: "✓" },
    { id: "competitor", label: "Konkurrenz", icon: "🏢" },
    { id: "other", label: "Sonstiges", icon: "❓" },
  ];
}

export function customerTypes(vertical: Vertical): Choice[] {
  if (vertical === "solar") {
    return ["EFH", "DHH", "MFH", "Reihenhaus", "Gewerbe", "Kalt"].map((id) => ({ id, label: id }));
  }
  return [
    { id: "EHT", label: "EHT" },
    { id: "DSL", label: "DSL" },
    { id: "Business", label: "Business" },
    { id: "Red Internet Phone", label: "Red I/P" },
    { id: "Ältere Tarife", label: "Ältere Tarife" },
    { id: "Kalt", label: "Kalt" },
  ];
}

export function appointmentTypes(vertical: Vertical): Choice[] {
  if (vertical === "solar") {
    return [
      { id: "Beratungstermin", label: "Beratungstermin", icon: "🗣️" },
      { id: "Erstgespräch / Qualifizierung", label: "Erstgespräch / Quali", icon: "📋" },
      { id: "Technisches Aufmaß", label: "Technisches Aufmaß", icon: "📐" },
      { id: "Montage / Installation", label: "Montage / Install.", icon: "👷" },
      { id: "Inbetriebnahme", label: "Inbetriebnahme", icon: "⚡" },
      { id: "Nachtermin", label: "Nachtermin", icon: "📅" },
      { id: "Sonstiges", label: "Sonstiges", icon: "📌" },
    ];
  }
  return [
    { id: "Einrichtung", label: "Einrichtung", icon: "🔧" },
    { id: "Nachtermin upsell", label: "Nachtermin upsell", icon: "📅" },
    { id: "Verkauf", label: "Verkauf", icon: "💰" },
    { id: "Rufnummerportierung", label: "Rufnummer-portierung", icon: "📞" },
    { id: "Techniker beauftragen", label: "Techniker beauftragen", icon: "👷" },
    { id: "Störung", label: "Störung", icon: "⚠️" },
    { id: "Sonstiges", label: "Sonstiges", icon: "📌" },
  ];
}

export const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Datum als YYYY-MM-DD in Ortszeit (v1 nutzte toISOString und rutschte nachts auf den Vortag). */
export function localDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function localTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Vorschlag für "später nochmal" wie in v1: in zwei Stunden, als datetime-local. */
export function defaultRetryAt(now = new Date()): string {
  const d = new Date(now.getTime() + 2 * 3_600_000);
  return `${localDate(d)}T${localTime(d)}`;
}

export function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Kommentar am Besuch wie in v1 (Grund/Notiz, "Später versuchen: …", "Versorgt bis: …"). */
export function visitComment(details: VisitDetails & { reason?: string; retryAt?: string }): string {
  return [
    details.reason && `Grund: ${details.reason}`,
    details.retryAt && `Später versuchen: ${details.retryAt}`,
    details.suppliedUntilDate && `Versorgt bis: ${details.suppliedUntilDate}`,
    details.appointmentType && `Termin: ${details.appointmentType}`,
    details.comment && `Notiz: ${details.comment}`,
  ]
    .filter(Boolean)
    .join(" | ");
}
