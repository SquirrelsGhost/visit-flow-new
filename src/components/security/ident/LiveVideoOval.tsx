import { motion, useReducedMotion } from "motion/react";

interface LiveVideoOvalProps {
  tone: "idle" | "live" | "warn" | "done";
  /** 0..1, füllt den Ring grün (Haltezeit bzw. Sprechzeit). */
  progress: number;
}

const STROKE = { idle: "rgba(255,255,255,0.35)", live: "rgba(255,255,255,0.85)", warn: "rgb(251 191 36)", done: "rgb(52 211 153)" } as const;

/** Gesichtsoval: gestrichelte Führung, darüber ein grüner Ring, der sich mit dem Fortschritt schließt. */
export default function LiveVideoOval({ tone, progress }: LiveVideoOvalProps) {
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
      <motion.ellipse
        cx="50" cy="48" rx="21" ry="29" fill="none" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="3 2.2"
        stroke={STROKE[tone]}
        animate={reduce || tone !== "live" ? undefined : { strokeDashoffset: [0, -10.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
      <motion.path
        d="M50 19 A21 29 0 1 1 49.99 19"
        fill="none" strokeWidth="1.4" strokeLinecap="round" stroke="rgb(52 211 153)"
        className="drop-shadow-[0_0_3px_rgba(52,211,153,0.9)]"
        initial={false}
        animate={{ pathLength: Math.max(0, Math.min(1, progress)), opacity: progress > 0.01 ? 1 : 0 }}
        transition={{ duration: 0.12, ease: "linear" }}
      />
    </svg>
  );
}
