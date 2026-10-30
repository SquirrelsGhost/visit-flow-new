/** Gemeinsame Klassen der Formular-Sheets (bauen auf den Glas-Klassen auf). */
export const FORM_GRID = "grid grid-cols-2 gap-x-2.5 gap-y-3";
export const FORM_CARD = "glass-surface rounded-[24px] p-4";
export const FORM_FIELD_LABEL = "block px-1 pb-1 text-[11.5px] font-medium text-muted-foreground";
export const FORM_SECONDARY_BUTTON =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900/[0.05] text-sm font-semibold text-foreground transition-[background-color,transform] duration-200 hover:bg-slate-900/[0.08] active:scale-[0.98] dark:bg-white/[0.07] dark:hover:bg-white/[0.11]";
/** Zeile aus zwei gleich hohen Karten ab iPad quer (wie GlassPair); auf dem Handy untereinander. */
export const FORM_PAIR = "space-y-4 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4 lg:space-y-0";
