/** Farben des Lade-Kompasses aus v1 (LoadingSpinner). */
export const SPINNER_COLORS = {
  red: {
    glow: "from-red-500/10 to-red-700/10 dark:from-red-500/5 dark:to-red-700/5",
    ring: "#dc2626",
    northMid: "#fecaca",
    northEnd: "#ef4444",
    northTip: "#991b1b",
    southEnd: "#7f1d1d",
  },
  purple: {
    glow: "from-purple-500/10 to-purple-700/10 dark:from-purple-500/5 dark:to-purple-700/5",
    ring: "#a855f7",
    northMid: "#e9d5ff",
    northEnd: "#a855f7",
    northTip: "#7c3aed",
    southEnd: "#5b21b6",
  },
} as const;

export const SPINNER_SIZES = { sm: 32, md: 48, lg: 64 } as const;
