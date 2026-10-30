import { LICENSE_PRICE } from "../onboarding/licenses";
import type { LicenseMember, PartnerState, SeatFilter, SeatRow, SeatState, TeamLicenses } from "./licenseTypes";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const cleanEmail = (value: string) => value.trim().toLowerCase();

const findMember = (list: readonly LicenseMember[], email: string) => list.find((m) => m.email === email);

/** v1 zeigte nur "Aktiv" (angemeldet) oder "Ausstehend"; v2 trennt zusätzlich deaktivierte Konten ab. */
export function seatState(member: LicenseMember | undefined): SeatState {
  if (!member?.registered) return "pending";
  return member.active ? "active" : "inactive";
}

export function partnerState(member: LicenseMember | undefined): PartnerState {
  if (!member?.registered) return "pending";
  return member.paying ? "paying" : "unpaid";
}

/** Alle Plätze in Reihenfolge: erst die vergebenen, dann die freien. */
export function seatRows(data: TeamLicenses): SeatRow[] {
  const taken: SeatRow[] = data.licensedEmails.map((email, index) => {
    const member = findMember(data.members, email);
    return { kind: "member", slot: index + 1, email, name: member?.name ?? null, state: seatState(member) };
  });
  const free: SeatRow[] = Array.from({ length: Math.max(0, data.licenseCount - taken.length) }, (_, i) => ({ kind: "free", slot: taken.length + i + 1 }));
  return [...taken, ...free];
}

export type SeatCounts = Record<SeatFilter, number>;

export function seatCounts(rows: readonly SeatRow[]): SeatCounts {
  const counts: SeatCounts = { all: rows.length, active: 0, pending: 0, inactive: 0, free: 0 };
  for (const row of rows) counts[row.kind === "free" ? "free" : row.state] += 1;
  return counts;
}

const matches = (row: SeatRow, filter: SeatFilter) => filter === "all" || (row.kind === "free" ? filter === "free" : row.state === filter);

/** Filter-Chip und Suche (Name oder E-Mail); freie Plätze fallen bei einer Suche heraus. */
export function filterRows(rows: readonly SeatRow[], filter: SeatFilter, query: string): SeatRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (!matches(row, filter)) return false;
    if (!q) return true;
    return row.kind === "member" && (row.email.includes(q) || (row.name ?? "").toLowerCase().includes(q));
  });
}

export const monthlyCost = (licenses: number) => licenses * LICENSE_PRICE;

/** Weniger Lizenzen als vergeben geht nicht (v1 zählte vergebene E-Mails immer mit). */
export const lowestCount = (data: TeamLicenses) => Math.max(data.minLicenses, data.licensedEmails.length);

/** Monatliche Gutschrift für zahlende Partner (v1 Partner-Gutschrift, Satz derzeit 0 %). */
export function partnerCredit(data: TeamLicenses): number {
  const paying = data.partners.filter((p) => partnerState(p) === "paying").length;
  return paying * LICENSE_PRICE * data.creditRate;
}

export type EmailProblem = "invalid" | "licensed" | "partner" | null;

/** Prüft eine neue Adresse: gültig und weder schon lizenziert noch als Partner eingetragen. */
export function emailProblem(value: string, data: TeamLicenses, except?: string): EmailProblem {
  const email = cleanEmail(value);
  if (!EMAIL.test(email)) return "invalid";
  if (email !== except && data.licensedEmails.includes(email)) return "licensed";
  if (email !== except && data.partnerEmails.includes(email)) return "partner";
  return null;
}

export const withEmail = (list: readonly string[], email: string) => [...list, cleanEmail(email)];
export const withoutEmail = (list: readonly string[], email: string) => list.filter((e) => e !== email);
export const replaceEmail = (list: readonly string[], from: string, to: string) => list.map((e) => (e === from ? cleanEmail(to) : e));

/** Anfangsbuchstabe für das Avatar-Kästchen. */
export const initialOf = (name: string | null, email: string) => (name?.trim() || email).charAt(0).toUpperCase();

/** Datum wie "1. November 2026"; ohne Datum ein Strich. */
export const formatDay = (iso: string | undefined) => (iso ? new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "–");

export interface SeatUsage {
  used: number;
  total: number;
  free: number;
  /** Mehr zugewiesen als gebucht. */
  over: number;
  /** Belegung 0–1 (über 1 bei Überbelegung). */
  share: number;
  tone: "red" | "green" | "amber";
}

/** Belegung für die Kopfkarte: Rot solange frei, Grün wenn genau voll, Bernstein bei Überbelegung. */
export function seatUsage(data: TeamLicenses): SeatUsage {
  const used = data.licensedEmails.length;
  const total = data.licenseCount;
  const over = Math.max(0, used - total);
  const share = total > 0 ? used / total : used > 0 ? 1 : 0;
  return { used, total, free: Math.max(0, total - used), over, share, tone: over > 0 ? "amber" : used === total && total > 0 ? "green" : "red" };
}
