import { COMPASS_PALETTE } from "../../components/auth/compassPalette";

/**
 * Maße und Farben des echten Visit-Flow-Logos, 1:1 aus favicon.svg (viewBox 0 0 200 200, Mitte 100/100).
 * Eine Quelle für das Logo in Leiste und Fußzeile (SVG) und den großen 3D-Kompass der Reise.
 */
export const LOGO = {
  disc: 100,
  outer: 75,
  outerStroke: 3,
  inner: 55,
  innerStroke: 2,
  tickFrom: 67,
  tickTo: 75,
  tickStroke: 1.5,
  tickOpacity: 0.8,
  needleTip: 72,
  needleHalf: 6,
  notch: 4,
  needleStroke: 0.5,
  dot: 3,
  dotStroke: 0.5,
  /** stdDeviation des Leuchtens (feGaussianBlur) am Außenring */
  glow: 2.5,
} as const;

export const LOGO_COLORS = COMPASS_PALETTE.normal;

/** Hintergrundscheibe der dunklen Logo-Variante (favicon.svg --bg1 / --bg2). */
export const LOGO_BG = { center: "#1a1a2e", rim: "#0f0f1a" } as const;

export type GradientStops = readonly (readonly [number, string])[];

/** Verläufe: Außen- und Innenring diagonal, Nordnadel von weißer Spitze zu Dunkelrot, Südnadel dunkel. */
export const RING_STOPS: GradientStops = [[0, LOGO_COLORS.ringStart], [1, LOGO_COLORS.ringEnd]];
export const NORTH_STOPS: GradientStops = [[0, "#ffffff"], [0.2, LOGO_COLORS.northMid], [0.6, LOGO_COLORS.northEnd], [1, LOGO_COLORS.northTip]];
export const SOUTH_STOPS: GradientStops = [[0, LOGO_COLORS.northTip], [1, LOGO_COLORS.southEnd]];

const { needleTip: T, needleHalf: H, notch: N } = LOGO;

/** Nadelhälften als SVG-Pfade vor der Drehung um 45° (Spitze, Fuß links, Kerbe, Fuß rechts). */
export const NEEDLE_PATHS = {
  north: `M 100 ${100 - T} L ${100 - H} 100 L 100 ${100 - N} L ${100 + H} 100 Z`,
  south: `M 100 ${100 + T} L ${100 - H} 100 L 100 ${100 + N} L ${100 + H} 100 Z`,
} as const;

/** Nadel steht im Logo auf 45° (Nordost). */
export const NEEDLE_ANGLE_DEG = 45;
