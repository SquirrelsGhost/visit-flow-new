/**
 * Farbwelten der Einstellungskarten wie in v1 (bg-gradient-to-br from-x-50 to-x-100/50 …).
 * Vollständige Klassen, damit Tailwind sie findet.
 */
export const SETTINGS_TONES = {
  blue: {
    tile: "bg-blue-500 text-white shadow-sm",
    card: "from-blue-50 to-blue-100/50 border-blue-200/60 dark:from-blue-950/30 dark:to-blue-900/20 dark:border-blue-800/50",
    icon: "bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400",
    solid: "bg-blue-600 text-white dark:bg-blue-500",
    text: "text-blue-800 dark:text-blue-200",
  },
  red: {
    tile: "bg-red-500 text-white shadow-sm",
    card: "from-red-50 to-red-100/50 border-red-200/60 dark:from-red-950/30 dark:to-red-900/20 dark:border-red-800/50",
    icon: "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400",
    solid: "bg-red-600 text-white dark:bg-red-500",
    text: "text-red-800 dark:text-red-200",
  },
  indigo: {
    tile: "bg-indigo-500 text-white shadow-sm",
    card: "from-indigo-50 to-indigo-100/50 border-indigo-200/60 dark:from-indigo-950/30 dark:to-indigo-900/20 dark:border-indigo-800/50",
    icon: "bg-indigo-500/20 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-400",
    solid: "bg-indigo-600 text-white dark:bg-indigo-500",
    text: "text-indigo-800 dark:text-indigo-200",
  },
  orange: {
    tile: "bg-orange-500 text-white shadow-sm",
    card: "from-orange-50 to-orange-100/50 border-orange-200/60 dark:from-orange-950/30 dark:to-orange-900/20 dark:border-orange-800/50",
    icon: "bg-orange-500/20 text-orange-700 dark:bg-orange-500/30 dark:text-orange-400",
    solid: "bg-orange-600 text-white dark:bg-orange-500",
    text: "text-orange-800 dark:text-orange-200",
  },
  rose: {
    tile: "bg-rose-500 text-white shadow-sm",
    card: "from-rose-50 to-rose-100/50 border-rose-200/60 dark:from-rose-950/30 dark:to-rose-900/20 dark:border-rose-800/50",
    icon: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/30 dark:text-rose-400",
    solid: "bg-rose-600 text-white dark:bg-rose-500",
    text: "text-rose-800 dark:text-rose-200",
  },
  purple: {
    tile: "bg-purple-500 text-white shadow-sm",
    card: "from-purple-50 to-purple-100/50 border-purple-200/60 dark:from-purple-950/30 dark:to-purple-900/20 dark:border-purple-800/50",
    icon: "bg-purple-500/20 text-purple-700 dark:bg-purple-500/30 dark:text-purple-400",
    solid: "bg-purple-600 text-white dark:bg-purple-500",
    text: "text-purple-800 dark:text-purple-200",
  },
  amber: {
    tile: "bg-amber-500 text-white shadow-sm",
    card: "from-amber-50 to-amber-100/50 border-amber-200/60 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800/50",
    icon: "bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-400",
    solid: "bg-amber-600 text-white dark:bg-amber-500",
    text: "text-amber-800 dark:text-amber-200",
  },
  green: {
    tile: "bg-green-500 text-white shadow-sm",
    card: "from-green-50 to-green-100/50 border-green-200/60 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-800/50",
    icon: "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400",
    solid: "bg-green-600 text-white dark:bg-green-500",
    text: "text-green-800 dark:text-green-200",
  },
  gray: {
    tile: "bg-slate-400 dark:bg-slate-600 text-white shadow-sm",
    card: "from-slate-50 to-slate-100/50 border-slate-200/70 dark:from-slate-900/40 dark:to-slate-800/30 dark:border-slate-700/60",
    icon: "bg-slate-400/20 text-slate-600 dark:bg-slate-500/30 dark:text-slate-300",
    solid: "bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200",
    text: "text-slate-700 dark:text-slate-300",
  },
} as const;

export type SettingsTone = keyof typeof SETTINGS_TONES;

