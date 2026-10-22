import { cn } from "../../lib/cn";
import { COMPASS_PALETTE, COMPASS_TICKS } from "./compassPalette";

interface CompassGraphicProps {
  qiblaMode: boolean;
  dimmed: boolean;
}

/** Kompass-Grafik des Login-Kopfs, Pfade und Farben 1:1 aus v1. */
export default function CompassGraphic({ qiblaMode, dimmed }: CompassGraphicProps) {
  const c = qiblaMode ? COMPASS_PALETTE.qibla : COMPASS_PALETTE.normal;
  return (
    <svg
      className={cn("w-20 h-20 max-[700px]:w-[52px] max-[700px]:h-[52px] drop-shadow-lg", dimmed && "opacity-50")}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="authCompassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.ringStart} />
          <stop offset="100%" stopColor={c.ringEnd} />
        </linearGradient>
        <linearGradient id="authNorthGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor={c.northMid} />
          <stop offset="60%" stopColor={c.northEnd} />
          <stop offset="100%" stopColor={c.northTip} />
        </linearGradient>
        <linearGradient id="authSouthGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={c.northTip} />
          <stop offset="100%" stopColor={c.southEnd} />
        </linearGradient>
        <filter id="authGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="75"
        fill="none"
        stroke="url(#authCompassGrad)"
        strokeWidth="3"
        filter="url(#authGlow)"
        opacity="0.7"
      />
      {COMPASS_TICKS.map((tick, i) => (
        <line key={i} {...tick} stroke={c.tick} strokeWidth="1.5" opacity="0.6" />
      ))}
      <circle cx="100" cy="100" r="55" fill="none" stroke="url(#authCompassGrad)" strokeWidth="2" opacity="0.5" />
      <g transform="rotate(45, 100, 100)">
        <path
          d="M 100 28 L 94 100 L 100 96 L 106 100 Z"
          fill="url(#authNorthGrad)"
          stroke={c.northStroke}
          strokeWidth="0.5"
          opacity="0.95"
        />
        <path
          d="M 100 172 L 94 100 L 100 104 L 106 100 Z"
          fill="url(#authSouthGrad)"
          stroke={c.southStroke}
          strokeWidth="0.5"
          opacity="0.7"
        />
      </g>
      <circle cx="100" cy="100" r="3" fill={c.tick} opacity="0.9" />
    </svg>
  );
}
