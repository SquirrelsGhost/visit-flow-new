import { cn } from "../../lib/cn";
import { GLASS_BUTTON_INLINE, GLASS_CARD, GLASS_INSET, GLASS_LABEL } from "../glass/glassStyles";

/** Wiederkehrende Klassen der Arena (Glas-Designsystem), damit lange Tailwind-Ketten nicht doppelt stehen. */
export const RED_BUTTON =
  "inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-b from-red-500 to-red-600 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(220,38,38,0.7)] transition-[filter,transform] hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none";

/** Kleiner runder Glasknopf neben einem Hauptknopf (Ablehnen, Kopieren). */
export const ROUND_GLASS_BUTTON =
  "glass-surface inline-flex shrink-0 items-center justify-center rounded-full text-slate-500 transition-[background-color,color,transform] duration-200 hover:bg-[var(--glass-hover)] hover:text-foreground active:scale-95 disabled:opacity-50 dark:text-white/60 dark:hover:text-white";

/** Kompakter Hauptknopf in Zeilen (Battle, Annehmen). */
export const PILL_BUTTON = cn(GLASS_BUTTON_INLINE, "h-9 shrink-0 gap-1.5 rounded-full px-4 text-[13px]");

export const ARENA_CARD = GLASS_CARD;

/** Kopfzeile eines Abschnitts: leise Überschrift in Versalien, rechts Zähler oder Aktion. */
export const SECTION_LABEL = `${GLASS_LABEL} flex items-center gap-2`;

export const AVATAR =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-red-500 to-red-700 text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_18px_-8px_rgba(220,38,38,0.7)] ring-1 ring-white/25";

/** Seitenfarben eines Duells: links Rot, rechts Blau, wie zwei Mannschaften. */
export const SIDE_AVATAR = {
  left: "bg-gradient-to-br from-rose-400 via-red-500 to-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_22px_-10px_rgba(220,38,38,0.8)]",
  right: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_22px_-10px_rgba(37,99,235,0.8)]",
} as const;

export const ADMIN_DIVIDER = "border-t border-[var(--glass-divider)] pt-3";

export const initial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

/** Karte für Verwaltung und Historie. */
export const PANEL_CARD = GLASS_CARD;

/** Eingelassene Fläche innerhalb einer Karte (Gruppen, Listen). */
export const INSET = GLASS_INSET;

/** Kleine Überschrift einer Gruppe in Versalien. */
export const GROUP_LABEL = "text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--glass-label)]";

/** Quadratische Symbol-Kachel vor Überschriften und Zeilen. */
export const ICON_TILE = "flex shrink-0 items-center justify-center rounded-xl ring-1 ring-inset";

/** Ruhige, gleitende Kurve für CSS-Übergänge (wie die Login-Reiter). */
export const GLIDE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0";

/** Schlichtes Feld (Suche, Auswahl) mit weichem Fokus-Leuchten wie im Login. */
export const SOFT_FIELD =
  "h-11 rounded-2xl border border-[var(--glass-divider)] bg-white/60 text-base sm:text-sm text-foreground shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-slate-400 focus:border-red-400/60 focus:ring-4 focus:ring-red-500/10 focus:outline-none dark:bg-white/[0.04] dark:placeholder:text-white/30";
