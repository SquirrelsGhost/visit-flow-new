import type { SettingsTone } from "../settings/settingsTones";
import type { LeadRole } from "./simulatorTypes";

export interface LeadLimits {
  min: number;
  max: number;
  step: number;
  /** Startwert beim Wechsel der Stufe */
  start: number;
}

/** Regler-Bereiche je Stufe (v1 leadLimits). */
export const LEAD_LIMITS: Record<LeadRole, LeadLimits> = {
  berater: { min: 0, max: 400, step: 10, start: 100 },
  ausbilder: { min: 400, max: 900, step: 50, start: 400 },
  teamleiter: { min: 900, max: 1300, step: 50, start: 900 },
  partner: { min: 1300, max: 3000, step: 100, start: 1300 },
};

export const LEAD_ROLES: readonly LeadRole[] = ["berater", "ausbilder", "teamleiter", "partner"];
export const LEAD_TONES: Record<LeadRole, SettingsTone> = { berater: "amber", ausbilder: "green", teamleiter: "blue", partner: "purple" };

/** App-Rolle → Lead-Stufe (v1 initialLeadRole). */
export function leadRoleFor(role: string | undefined): LeadRole {
  if (role === "mentor") return "ausbilder";
  if (role === "strukturleiter") return "teamleiter";
  if (role === "teamleiter" || role === "gebietsmanager" || role === "admin") return "partner";
  return "berater";
}

export const BERATER_BASE_RATE = 80;
export const BERATER_BONUS_RATE = 90;
export const BERATER_BONUS_FROM = 100;

export type LeadFormula =
  | { kind: "berater"; leads: number; rate: number }
  | { kind: "overhead"; ownLeads: number; ownRate: number; ownTotal: number; teamLeads: number; overheadRate: number; overheadTotal: number }
  | { kind: "partner"; teamLeads: number; rate: number };

export interface LeadResult {
  total: number;
  formula: LeadFormula;
  /** 100-Nettos-Regel greift (nur Berater zeigt den Hinweis) */
  bonusActive: boolean;
}

/**
 * Lead-Provision 1:1 aus v1: Berater 80 € je Netto-Lead, ab 100 rückwirkend 90 €. Ausbilder 100 eigene × 100 €
 * plus 10 € Overhead je Teamlead, Teamleiter 75 eigene × 100 € plus 20 € je Teamlead, Partner 23 € Misch-Overhead.
 */
export function leadCommission(role: LeadRole, count: number): LeadResult {
  const safeCount = Number.isFinite(count) ? count : 0;
  const n = Math.max(0, Math.floor(safeCount));
  if (role === "berater") {
    const rate = n >= BERATER_BONUS_FROM ? BERATER_BONUS_RATE : BERATER_BASE_RATE;
    return { total: n * rate, formula: { kind: "berater", leads: n, rate }, bonusActive: n >= BERATER_BONUS_FROM };
  }
  if (role === "partner") return { total: n * 23, formula: { kind: "partner", teamLeads: n, rate: 23 }, bonusActive: false };
  const own = role === "ausbilder" ? 100 : 75;
  const overheadRate = role === "ausbilder" ? 10 : 20;
  const ownTotal = own * 100;
  const overheadTotal = n * overheadRate;
  return {
    total: ownTotal + overheadTotal,
    formula: { kind: "overhead", ownLeads: own, ownRate: 100, ownTotal, teamLeads: n, overheadRate, overheadTotal },
    bonusActive: role === "ausbilder",
  };
}

/** Eingabe auf den Bereich der Stufe begrenzen (v1 onBlur). */
export const clampLeads = (count: number, limits: LeadLimits) => Math.min(limits.max, Math.max(limits.min, Math.round(count) || 0));
