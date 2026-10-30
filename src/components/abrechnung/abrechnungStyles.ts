import { GLASS_BUTTON_INLINE, GLASS_CARD, GLASS_FIELD, GLASS_INSET } from "../glass/glassStyles";

/** Wiederkehrende Klassen der Abrechnung, aus dem Glas-Designsystem. */

/** Hauptkarte: Glasfläche mit Lichtkante. */
export const CARD =
  GLASS_CARD;

/** Eingelassene Fläche innerhalb einer Karte. */
export const INSET =
  GLASS_INSET;

export const GROUP_LABEL =
  "text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--glass-label)]";

export const CARD_TITLE =
  "text-[15px] font-semibold tracking-[-0.01em] text-foreground";

export const MUTED =
  "text-xs text-muted-foreground";

/** Runder Symbolknopf (Monat zurück/vor, Menü, Schließen). */
export const ICON_BUTTON =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-[var(--glass-hover)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 dark:text-white/50";

/** Primärer Knopf in der Abrechnungs-Farbe. */
export const PRIMARY_BUTTON =
  `${GLASS_BUTTON_INLINE} px-4`;

export const OUTLINE_BUTTON =
  "glass-surface inline-flex h-11 items-center justify-center gap-2 rounded-[24px] px-4 text-sm font-medium text-foreground transition-[background-color,transform] hover:bg-[var(--glass-hover)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const SMALL_BUTTON =
  "glass-surface inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-foreground transition-[background-color,transform] hover:bg-[var(--glass-hover)] active:scale-95";

export const FIELD =
  GLASS_FIELD;

/** Auswahl-Chip (Status, Grund, Zeitraum). */
export const chip = (active: boolean) =>
  active
    ? "border-transparent bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_16px_-6px_rgba(220,38,38,0.6)]"
    : "border-[var(--glass-divider)] bg-[var(--glass-fill)] text-foreground/80 hover:bg-[var(--glass-hover)]";

/** Ruhige, gleitende Kurve für CSS-Übergänge. */
export const GLIDE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0";

export const TONE_TEXT = {
  ok: "text-emerald-600 dark:text-emerald-400",
  missing: "text-rose-600 dark:text-rose-400",
  extra: "text-amber-600 dark:text-amber-400",
} as const;

export const TONE_GLOW = {
  ok: "from-emerald-400/25 via-teal-300/10",
  missing: "from-rose-400/25 via-orange-300/10",
  extra: "from-amber-400/25 via-yellow-300/10",
} as const;
