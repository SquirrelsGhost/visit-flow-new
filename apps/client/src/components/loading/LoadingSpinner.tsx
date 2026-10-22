import { cn } from "../../lib/cn";
import { COMPASS_TICKS } from "../auth/compassPalette";
import { SPINNER_COLORS, SPINNER_SIZES } from "./spinnerColors";

interface LoadingSpinnerProps {
  size?: keyof typeof SPINNER_SIZES;
  className?: string;
  color?: keyof typeof SPINNER_COLORS;
}

/** Drehender Kompass als Ladeanzeige, 1:1 aus v1. */
export default function LoadingSpinner({ size = "md", className, color = "red" }: LoadingSpinnerProps) {
  const px = SPINNER_SIZES[size];
  const c = SPINNER_COLORS[color];
  const uid = `compass-${size}-${color}`;
  return (
    <div className={cn("relative inline-block", className)} style={{ width: px, height: px }} role="status">
      <div className={cn("absolute inset-0 bg-gradient-to-br rounded-full blur-lg animate-pulse", c.glow)} />
      <div className="relative z-10 animate-spin" style={{ animationDuration: "3s" }}>
        <svg width={px} height={px} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md" aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.ring} stopOpacity={1} />
              <stop offset="100%" stopColor={c.ring} stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id={`${uid}-north`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor={c.northMid} />
              <stop offset="60%" stopColor={c.northEnd} />
              <stop offset="100%" stopColor={c.northTip} />
            </linearGradient>
            <linearGradient id={`${uid}-south`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={c.northTip} />
              <stop offset="100%" stopColor={c.southEnd} />
            </linearGradient>
            <filter id={`${uid}-glow`}>
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r="75" fill="none" stroke={`url(#${uid}-grad)`} strokeWidth="3" filter={`url(#${uid}-glow)`} opacity="0.6" />
          {COMPASS_TICKS.map((tick, i) => (
            <line key={i} {...tick} stroke={c.ring} strokeWidth="1.5" opacity="0.5" />
          ))}
          <circle cx="100" cy="100" r="55" fill="none" stroke={`url(#${uid}-grad)`} strokeWidth="2" opacity="0.4" />
          <g transform="rotate(45, 100, 100)">
            <path d="M 100 28 L 94 100 L 100 96 L 106 100 Z" fill={`url(#${uid}-north)`} stroke={c.northEnd} strokeWidth="0.5" opacity="0.9" />
            <path d="M 100 172 L 94 100 L 100 104 L 106 100 Z" fill={`url(#${uid}-south)`} stroke={c.southEnd} strokeWidth="0.5" opacity="0.6" />
          </g>
          <circle cx="100" cy="100" r="3" fill="currentColor" className="text-background dark:text-neutral-900" opacity="0.8" />
          <circle cx="100" cy="100" r="3" fill="none" stroke={c.ring} strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
