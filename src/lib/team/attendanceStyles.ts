import type { GlassTone } from "../glass/glassTones";
import type { AttendanceGroup } from "./attendance";

/** Farben der Anwesenheitsgruppen wie v1: offen Bernstein, Rest Grau, anwesend Grün, zu spät Orange, entschuldigt Lila, fehlt Rosa. */
export const GROUP_TONE: Record<AttendanceGroup, GlassTone> = {
  pending: "amber",
  open: "gray",
  present: "green",
  late: "orange",
  excused: "purple",
  absent: "rose",
};

/** Füllung der Segmente im Anwesenheitsbalken. Vollständige Klassen für Tailwind. */
export const GROUP_BAR: Record<AttendanceGroup, string> = {
  pending: "bg-gradient-to-r from-yellow-300 to-amber-500",
  open: "bg-slate-300 dark:bg-white/20",
  present: "bg-gradient-to-r from-emerald-300 to-emerald-500",
  late: "bg-gradient-to-r from-amber-400 to-orange-500",
  excused: "bg-gradient-to-r from-fuchsia-400 to-purple-500",
  absent: "bg-gradient-to-r from-pink-400 to-rose-500",
};

/** Kleine Plakette rechts in der Zeile. */
export const GROUP_CHIP: Record<AttendanceGroup, string> = {
  pending: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  open: "bg-slate-900/[0.05] text-slate-500 ring-slate-900/[0.06] dark:bg-white/[0.06] dark:text-white/60 dark:ring-white/10",
  present: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  late: "bg-orange-500/12 text-orange-700 ring-orange-500/20 dark:text-orange-300",
  excused: "bg-purple-500/12 text-purple-700 ring-purple-500/20 dark:text-purple-300",
  absent: "bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300",
};
