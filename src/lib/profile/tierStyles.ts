import type { TierLevel } from "./profileTypes";

/** Farben der Stufen wie v1 getLevelTier; Verlauf des XP-Rings als zwei Stopps. */
export const TIER_STOPS: Record<TierLevel, readonly [string, string]> = {
  bronze: ["#f59e0b", "#92400e"],
  silver: ["#e2e8f0", "#64748b"],
  gold: ["#fde047", "#ca8a04"],
  platinum: ["#22d3ee", "#2563eb"],
  diamond: ["#c084fc", "#ec4899"],
};

/** Plakette (Level, Erfolgs-Symbol); vollständige Klassen, damit Tailwind sie findet. */
export const TIER_BADGE: Record<TierLevel, string> = {
  bronze: "bg-gradient-to-br from-amber-500 to-amber-800 text-white",
  silver: "bg-gradient-to-br from-slate-200 to-slate-500 text-slate-900",
  gold: "bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950",
  platinum: "bg-gradient-to-br from-cyan-400 to-blue-600 text-white",
  diamond: "bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 text-white",
};

/** Schimmer hinter dem Kopf der Seite in der Farbe der Stufe. */
export const TIER_GLOW: Record<TierLevel, string> = {
  bronze: "from-amber-500/[0.14]",
  silver: "from-slate-400/[0.16]",
  gold: "from-yellow-400/[0.16]",
  platinum: "from-cyan-400/[0.16]",
  diamond: "from-fuchsia-500/[0.16]",
};
