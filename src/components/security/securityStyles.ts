import type { GlassTone } from "../../lib/glass/glassTones";
import type { AlertSeverity, AuditCategory, BlockCategory, HealthLevel, ThreatLevel } from "../../lib/security/securityTypes";

type ChipTone = "red" | "slate" | "amber" | "green" | "blue";

/** Farbe je Sicherheitslage: Ring, Schein der Kopfkarte, Schrift. */
export const HEALTH_STYLE: Record<HealthLevel, { ring: "green" | "amber" | "red"; glow: string; text: string }> = {
  excellent: { ring: "green", glow: "rgba(16,185,129,0.4)", text: "text-emerald-300" },
  good: { ring: "green", glow: "rgba(56,189,248,0.36)", text: "text-sky-300" },
  warning: { ring: "amber", glow: "rgba(245,158,11,0.42)", text: "text-amber-300" },
  critical: { ring: "red", glow: "rgba(244,63,94,0.48)", text: "text-rose-300" },
};

export const SEVERITY_STYLE: Record<AlertSeverity, { tone: GlassTone; chip: ChipTone }> = {
  CRITICAL: { tone: "red", chip: "red" },
  WARNING: { tone: "amber", chip: "amber" },
  INFO: { tone: "blue", chip: "blue" },
};

/** Echte Nutzer blau (meist Fehlalarm), Angreifer rot, Honeypot lila, Manuell grau. */
export const CATEGORY_STYLE: Record<BlockCategory, { tone: GlassTone; chip: ChipTone }> = {
  real_user: { tone: "blue", chip: "blue" },
  rate_limit: { tone: "amber", chip: "amber" },
  manual: { tone: "gray", chip: "slate" },
  scraper: { tone: "orange", chip: "amber" },
  severe: { tone: "red", chip: "red" },
  honeypot: { tone: "purple", chip: "red" },
};

export const THREAT_STYLE: Record<ThreatLevel, { bar: string; text: string }> = {
  high: { bar: "from-rose-400 to-red-600", text: "text-red-600 dark:text-red-400" },
  elevated: { bar: "from-amber-400 to-orange-500", text: "text-orange-600 dark:text-orange-400" },
  watch: { bar: "from-yellow-300 to-amber-500", text: "text-amber-600 dark:text-amber-400" },
  low: { bar: "from-emerald-300 to-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
};

export const AUDIT_STYLE: Record<AuditCategory, { tone: GlassTone; chip: ChipTone }> = {
  SECURITY: { tone: "red", chip: "red" },
  ADMIN: { tone: "indigo", chip: "blue" },
  USER: { tone: "green", chip: "green" },
  SYSTEM: { tone: "gray", chip: "slate" },
};

/** IP-Adressen und Kennungen in Festbreitenschrift, damit Ziffern untereinander stehen. */
export const MONO = "font-mono text-[12.5px] tabular-nums tracking-tight";
/** Kleiner Knopf in einer Zeile (Entsperren, Bestätigen). */
export const ROW_BUTTON =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full px-3 text-[12.5px] font-semibold transition-[background-color,transform] duration-200 active:scale-[0.97] disabled:opacity-50 motion-reduce:transition-none";
export const ROW_BUTTON_TONE = {
  green: "bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300",
  red: "bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-300",
  slate: "bg-slate-900/[0.05] text-slate-700 hover:bg-slate-900/[0.08] dark:bg-white/[0.07] dark:text-white/80 dark:hover:bg-white/[0.11]",
} as const;
/** Kleine Kopfzeile innerhalb einer Glaskarte. */
export const CARD_HEAD = "flex items-center justify-between gap-3 px-4 pb-1 pt-4";
export const FACT_LABEL = "block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]";
export const EMPTY_ROW = "px-4 py-5 text-center text-[13px] text-muted-foreground";
