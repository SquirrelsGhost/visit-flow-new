/** Wiederkehrende Klassen des Team-Buchens, damit Felder, Kacheln und Buttons überall gleich aussehen. */

/** Eingabefeld mit Symbol links, gleicher Fokus wie die Login-Felder. */
export const FIELD =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] placeholder:font-normal placeholder:text-muted-foreground transition-[border-color,box-shadow,background-color] duration-300 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/[0.08] dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-white dark:hover:border-neutral-700 dark:focus:border-red-500/70 dark:focus:bg-neutral-900 dark:focus:ring-red-500/20";

/** Ruhige Fläche für zusammengehörige Einstellungen. */
export const PANEL = "rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]";

/** Kleine Wahlknöpfe (Teamgröße, Zahlweise) mit gleitender Markierung. */
export const CHIP =
  "relative rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums transition-colors duration-300 touch-manipulation";

/** Roter Hauptbutton, gleiche Haptik wie "Anmelden". */
export const PRIMARY =
  "button-sheen inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-red-500 to-red-600 font-bold tracking-tight text-white ring-1 ring-inset ring-white/15 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_12px_28px_-12px_rgba(220,38,38,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:from-red-600 hover:to-red-700 active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 touch-manipulation";

/** Zurückhaltender Zweitbutton. */
export const SECONDARY =
  "glass-surface inline-flex items-center justify-center gap-2 rounded-[24px] font-bold text-foreground transition-colors duration-300 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 dark:hover:border-neutral-700 dark:hover:bg-white/[0.04] touch-manipulation";
