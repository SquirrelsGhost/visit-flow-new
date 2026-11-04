import { useId } from "react";
import { COMPASS_TICKS } from "../../auth/compassPalette";
import { LOGO, LOGO_BG, LOGO_COLORS, NEEDLE_ANGLE_DEG, NEEDLE_PATHS, NORTH_STOPS, RING_STOPS, SOUTH_STOPS, type GradientStops } from "../../../lib/website/logoSpec";

/**
 * Echtes Visit-Flow-Logo als Vektorgrafik, Pfade und Farben 1:1 aus favicon.svg (dunkle Variante).
 * Als SVG statt Bild: gestochen scharf in jeder Größe und auf jedem Bildschirm.
 */
interface CompassMarkProps {
  size?: number;
}

const stopsOf = (stops: GradientStops) => stops.map(([at, color]) => <stop key={at} offset={`${at * 100}%`} stopColor={color} />);

export default function CompassMark({ size = 32 }: CompassMarkProps) {
  // Eigene IDs pro Logo, weil Leiste und Fußzeile es gleichzeitig zeigen
  const id = `vfl${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden
      className="shrink-0 rounded-full shadow-[0_0_24px_-4px_rgba(239,68,68,0.65)]"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={LOGO_BG.center} />
          <stop offset="100%" stopColor={LOGO_BG.rim} />
        </radialGradient>
        <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
          {stopsOf(RING_STOPS)}
        </linearGradient>
        <linearGradient id={`${id}-north`} x1="50%" y1="0%" x2="50%" y2="100%">
          {stopsOf(NORTH_STOPS)}
        </linearGradient>
        <linearGradient id={`${id}-south`} x1="50%" y1="0%" x2="50%" y2="100%">
          {stopsOf(SOUTH_STOPS)}
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation={LOGO.glow} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r={LOGO.disc} fill={url("bg")} />
      <circle cx="100" cy="100" r={LOGO.outer} fill="none" stroke={url("ring")} strokeWidth={LOGO.outerStroke} filter={url("glow")} />
      {COMPASS_TICKS.map((tick, i) => (
        <line key={i} {...tick} stroke={LOGO_COLORS.tick} strokeWidth={LOGO.tickStroke} opacity={LOGO.tickOpacity} />
      ))}
      <circle cx="100" cy="100" r={LOGO.inner} fill="none" stroke={url("ring")} strokeWidth={LOGO.innerStroke} />
      <g transform={`rotate(${NEEDLE_ANGLE_DEG}, 100, 100)`}>
        <path d={NEEDLE_PATHS.north} fill={url("north")} stroke={LOGO_COLORS.northStroke} strokeWidth={LOGO.needleStroke} />
        <path d={NEEDLE_PATHS.south} fill={url("south")} stroke={LOGO_COLORS.southStroke} strokeWidth={LOGO.needleStroke} />
      </g>
      <circle cx="100" cy="100" r={LOGO.dot} fill={LOGO_BG.center} stroke={LOGO_COLORS.tick} strokeWidth={LOGO.dotStroke} />
    </svg>
  );
}
