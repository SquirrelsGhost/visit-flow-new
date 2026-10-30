/**
 * Gemeinsame Klassen des Glas-Designsystems. Die Farben stehen als Variablen in styles/glass.css,
 * hier nur Maße, Abstände und Schrift, damit jede Seite gleich edel aussieht.
 */
export const GLASS_PAGE = "relative h-full overflow-hidden";
/** Runder Glasknopf (Topbar, Kartensteuerung). */
export const GLASS_ICON_BUTTON =
  "glass-surface no-touch-target-fix flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition-[transform,background-color] duration-200 hover:bg-[var(--glass-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";
/** Reiterleiste (Segment-Steuerung): Glasschiene, darin gleitet die leuchtende rote Fläche. */
export const GLASS_SEGMENT_TRACK = "glass-surface flex gap-1 rounded-[22px] p-1.5";
export const GLASS_SEGMENT_PILL =
  "absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500 to-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(220,38,38,0.75)]";
export const GLASS_SEGMENT_IDLE = "text-slate-500 hover:text-foreground dark:text-white/50 dark:hover:text-white";
/** Aufklapp-Menü und schwebende Tafel: Glas mit echter Unschärfe, weil Inhalt darunter liegt. */
export const GLASS_POPOVER = "glass-surface glass-blur rounded-[22px]";
/** Leiste über scrollendem Inhalt (Topbar, untere Navigation): einzige Stelle mit echter Unschärfe. */
export const GLASS_BAR = "glass-bar shadow-[inset_0_-1px_0_var(--glass-divider)]";
/**
 * Waagrecht scrollende Filter-Reihe über Karten. Oben gleicht -mt die Schattenluft aus; unten bewusst kein
 * negativer Rand, sonst schluckt er den festen Abstand der Seite (space-y-7) und die Karte klebt am Filter.
 */
export const GLASS_CHIP_ROW = "-mx-4 -mt-1.5 flex gap-1.5 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
/** Reiterleiste über einer Glas-Seite: unten 8px plus pt-5 der Seite ergeben dieselben 28px wie zwischen Karten. */
export const GLASS_TAB_BAR = "relative z-10 shrink-0 px-4 pb-2 pt-4";
/** Inhaltsspalte: auf dem Handy schmal, auf dem Tablet hochkant etwas breiter. */
export const GLASS_BODY = "mx-auto w-full max-w-xl space-y-7 px-4 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] pt-5 md:max-w-2xl md:px-6";
/** Ab iPad quer (lg) die volle Breite für feste Raster (GlassSplit, GlassPair). */
export const GLASS_BODY_WIDE = "lg:max-w-6xl lg:px-8";
/** Seitenleiste links (Kopfkarte, Filter, Aktionen), Inhalt rechts; auf dem Handy untereinander. */
export const GLASS_SPLIT = "space-y-7 lg:grid lg:items-start lg:gap-7 lg:space-y-0";
export const GLASS_SPLIT_RATIO = { aside: "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", even: "lg:grid-cols-2" } as const;
export const GLASS_SPLIT_COL = "min-w-0 space-y-7";
/**
 * Zeile aus zwei gleich hohen Karten ab iPad quer. Kinder strecken sich auf die Zeilenhöhe,
 * Abschnitte (Überschrift + Karte) lassen dabei ihre Karte wachsen, damit unten keine Kante springt.
 */
/** Spalte in einer GlassPair aus mehreren Karten: die erste wächst, die übrigen behalten ihre Höhe. */
export const GLASS_STACK = "space-y-7 lg:flex lg:flex-col lg:gap-7 lg:space-y-0 lg:[&>*:first-child]:flex-1";
export const GLASS_PAIR = "space-y-7 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-7 lg:space-y-0 lg:[&>*]:min-w-0";
/** Höhe von GLASS_LABEL (16,5px Zeile + 10px Abstand). */
export const GLASS_PAIR_OFFSET = { first: "lg:[&>*:first-child]:mt-[26.5px]", second: "lg:[&>*:last-child]:mt-[26.5px]" } as const;

export const GLASS_CARD = "glass-surface overflow-hidden rounded-[26px]";
export const GLASS_DEEP = "glass-deep overflow-hidden rounded-[28px]";
/** Eingelassene Fläche innerhalb einer Glaskarte. */
export const GLASS_INSET = "rounded-2xl bg-[var(--glass-track)]/60 ring-1 ring-inset ring-[var(--glass-divider)]";
export const GLASS_LABEL = "px-1 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--glass-label)]";
export const GLASS_FOOTER = "px-1 pt-2.5 text-[12px] leading-snug text-[var(--glass-label)]";
/** Trennlinie beginnt erst nach dem Symbol und verblasst zum Rand hin. */
export const GLASS_DIVIDER =
  "[&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:left-[4.25rem] [&>*+*]:before:right-4 [&>*+*]:before:top-0 [&>*+*]:before:h-px [&>*+*]:before:bg-[var(--glass-divider)]";

export const GLASS_ROW = "relative flex min-h-[3.75rem] w-full items-center gap-3.5 px-4 py-3 text-left";
export const GLASS_ROW_INTERACTIVE =
  "transition-[background-color,transform] duration-300 ease-out hover:bg-[var(--glass-hover)] active:bg-[var(--glass-press)] focus:outline-none focus-visible:bg-[var(--glass-hover)]";
export const GLASS_ICON = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-[0_6px_16px_-6px] ring-1 ring-inset ring-white/25";
export const GLASS_TITLE = "block text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground";
export const GLASS_SUBTITLE = "mt-0.5 block text-[12.5px] leading-snug text-muted-foreground";
export const GLASS_VALUE = "shrink-0 text-[14px] font-medium text-muted-foreground";
export const GLASS_CHEVRON = "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none dark:text-white/30";

export const GLASS_FIELD =
  "h-12 w-full rounded-2xl border border-[var(--glass-divider)] bg-white/60 px-4 text-base text-foreground shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-slate-400 focus:border-red-400/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 sm:text-sm dark:bg-white/[0.04] dark:placeholder:text-white/30 dark:focus:bg-white/[0.07]";
/** Hauptknopf: roter Verlauf mit Lichtkante und Schein; ohne feste Breite. */
export const GLASS_BUTTON_INLINE =
  "group/btn relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-red-500 to-red-600 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_24px_-10px_rgba(220,38,38,0.7)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";
export const GLASS_BUTTON = `${GLASS_BUTTON_INLINE} w-full`;
