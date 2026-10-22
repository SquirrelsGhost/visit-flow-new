/** Farben des Login-Kompasses: rot im Normalmodus, grün im Qibla-Modus (v1 AuthHeader). */
export const COMPASS_PALETTE = {
  normal: {
    ringStart: "#ef4444",
    ringEnd: "#dc2626",
    northMid: "#fecaca",
    northEnd: "#ef4444",
    northTip: "#991b1b",
    southEnd: "#7f1d1d",
    tick: "#dc2626",
    northStroke: "#ef4444",
    southStroke: "#7f1d1d",
  },
  qibla: {
    ringStart: "#10b981",
    ringEnd: "#059669",
    northMid: "#a7f3d0",
    northEnd: "#10b981",
    northTip: "#059669",
    southEnd: "#047857",
    tick: "#10b981",
    northStroke: "#059669",
    southStroke: "#047857",
  },
} as const;

/** Endpunkte der 12 Striche am Außenring (alle 30°). */
export const COMPASS_TICKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  return {
    x1: 100 + 75 * Math.sin(angle),
    y1: 100 - 75 * Math.cos(angle),
    x2: 100 + 67 * Math.sin(angle),
    y2: 100 - 67 * Math.cos(angle),
  };
});
