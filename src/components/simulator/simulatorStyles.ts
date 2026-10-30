/** Gemeinsame Klassen des Simulators; Gruppen und Zeilen kommen aus den Einstellungen (iOS-Stil). */
export const CHIP =
  "relative inline-flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none";
export const CHIP_IDLE = "bg-[var(--glass-track)] text-slate-600 hover:text-foreground dark:text-white/70";
/** Gewählt: Verlauf der Glas-Farbe mit Lichtkante, wie die Glas-Symbole. */
export const CHIP_PILL = "absolute inset-0 rounded-xl bg-gradient-to-b shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-10px_rgba(15,23,42,0.55)]";
export const PHASE_LABEL = "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]";
export const PAD = "px-4 py-3.5";
export const MONEY = "tabular-nums tracking-tight";
export const ICON_BUTTON =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition-[background-color,transform] duration-200 hover:bg-[var(--glass-hover)] active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none dark:text-white/70";
/** Zweite Schaltfläche auf der tiefen Ergebniskarte. */
export const SECONDARY_BUTTON =
  "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/[0.08] text-sm font-semibold text-white ring-1 ring-inset ring-white/15 transition-[background-color,transform] duration-200 hover:bg-white/[0.14] active:scale-[0.98] disabled:opacity-50 motion-reduce:transition-none";
export const TRACK = "bg-[var(--glass-track)]";
export const HORIZONTAL_SCROLL = "-mx-4 -my-2 flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
