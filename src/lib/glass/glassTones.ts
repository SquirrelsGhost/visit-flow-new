/**
 * Farbwelten der Glas-Symbole: runde Verlaufs-Plaketten mit farbigem Schein darunter.
 * Gleiche Namen wie die Töne der Einstellungen, damit Zeilen ihre Farbe behalten.
 * Vollständige Klassen, damit Tailwind sie findet.
 */
export const GLASS_TONES = {
  blue: { icon: "from-sky-400 to-blue-600 shadow-blue-500/45", bar: "from-sky-400 to-blue-500" },
  red: { icon: "from-rose-400 to-red-600 shadow-red-500/45", bar: "from-rose-400 to-red-500" },
  indigo: { icon: "from-indigo-400 to-indigo-600 shadow-indigo-500/45", bar: "from-indigo-400 to-violet-500" },
  orange: { icon: "from-amber-400 to-orange-600 shadow-orange-500/45", bar: "from-amber-400 to-orange-500" },
  rose: { icon: "from-pink-400 to-rose-600 shadow-rose-500/45", bar: "from-pink-400 to-rose-500" },
  purple: { icon: "from-fuchsia-400 to-purple-600 shadow-purple-500/45", bar: "from-fuchsia-400 to-purple-500" },
  amber: { icon: "from-yellow-300 to-amber-500 shadow-amber-500/45", bar: "from-yellow-300 to-amber-500" },
  green: { icon: "from-emerald-300 to-emerald-600 shadow-emerald-500/45", bar: "from-emerald-300 to-emerald-500" },
  gray: { icon: "from-slate-400 to-slate-600 shadow-slate-500/35", bar: "from-slate-300 to-slate-500" },
} as const;

export type GlassTone = keyof typeof GLASS_TONES;
