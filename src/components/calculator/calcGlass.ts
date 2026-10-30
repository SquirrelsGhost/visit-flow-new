import { GLASS_BUTTON, GLASS_CARD, GLASS_DEEP, GLASS_FIELD } from "../glass/glassStyles";

/**
 * Klassen des Rechners aus dem Glas-Designsystem (components/glass), damit Strom/Gas, Telco, Lead
 * und der Taschenrechner genauso aussehen wie Profil und Einstellungen.
 */
export const CALC_CARD = `${GLASS_CARD} p-4 md:p-5`;
export const CALC_DEEP = GLASS_DEEP;
/** Kachel innerhalb einer Glaskarte (Preis, Option, Detail). */
export const CALC_TILE = "rounded-2xl bg-white/55 ring-1 ring-inset ring-[var(--glass-divider)] dark:bg-white/[0.04]";
export const CALC_TILE_ON = "rounded-2xl bg-red-500/[0.07] ring-1 ring-inset ring-red-500/30 dark:bg-red-500/10";
export const CALC_TILE_HOVER = "transition-[background-color,box-shadow] duration-300 hover:bg-white/80 dark:hover:bg-white/[0.07]";
export const CALC_LABEL = "text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]";
export const CALC_FIELD_LABEL = "text-[12px] font-medium text-[var(--glass-label)]";
export const CALC_INPUT = GLASS_FIELD;
export const CALC_SELECT = `${GLASS_FIELD} cursor-pointer appearance-none truncate pr-10`;
/** Feld mit Einheit rechts: der Rahmen sitzt am Wrapper, das Eingabefeld ist durchsichtig. */
export const CALC_FIELD_WRAP =
  "flex h-12 items-center rounded-2xl border border-[var(--glass-divider)] bg-white/60 px-4 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background-color] duration-300 focus-within:border-red-400/60 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-500/10 dark:bg-white/[0.04] dark:focus-within:bg-white/[0.07]";

/** Segment-Steuerung: ruhige Spur, die weiße Fläche gleitet zur Auswahl. */
export const CALC_TRACK = "flex gap-1 rounded-2xl bg-[var(--glass-track)] p-1";
export const CALC_PILL =
  "absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_6px_16px_-8px_rgba(15,23,42,0.35)] dark:bg-white/[0.14]";
/** Hauptreiter: leuchtend rote Fläche wie die Reiter der Einstellungen. */
export const CALC_PILL_RED =
  "absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500 to-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(220,38,38,0.75)]";

export const CALC_SMALL_BTN =
  "h-9 shrink-0 rounded-xl bg-[var(--glass-track)] px-3 text-xs font-semibold text-foreground/80 transition-colors hover:bg-[var(--glass-press)] disabled:opacity-40";
export const CALC_PRIMARY = GLASS_BUTTON;
export const CALC_SUCCESS = GLASS_BUTTON.replace("from-red-500 to-red-600", "from-emerald-500 to-emerald-600").replace(
  "rgba(220,38,38,0.7)",
  "rgba(5,150,105,0.7)",
);
export const CALC_SECONDARY =
  "glass-surface inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-foreground transition-transform duration-200 active:scale-[0.98]";
/** Haken einer erledigten Auswahl. */
export const CALC_CHECK_ON = "bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-[0_4px_10px_-4px_rgba(16,185,129,0.8)]";
