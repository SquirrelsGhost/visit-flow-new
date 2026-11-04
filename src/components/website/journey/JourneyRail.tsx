// Fortschrittsleiste der Reise: braucht den Browser
"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { journeyStations } from "../../../texts/websiteJourneyTexts";

/** Schmale Leiste am rechten Rand: eine Linie füllt sich, jede Station ist ein Punkt, der aufleuchtet. Ab Tablet. */
interface JourneyRailProps {
  progress: MotionValue<number>;
}

function RailDot({ progress, at, to, label }: { progress: MotionValue<number>; at: number; to: number; label: string }) {
  const lit = useTransform(progress, [at - 0.01, at], [0, 1]);
  const current = useTransform(progress, [at - 0.01, at, to - 0.01, to], [0, 1, 1, 0]);
  const scale = useTransform(lit, [0, 1], [0.6, 1]);
  return (
    <span className="absolute right-0 flex -translate-y-1/2 items-center gap-3" style={{ top: `${at * 100}%` }}>
      <motion.span style={{ opacity: current }} className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
        {label}
      </motion.span>
      <motion.span style={{ scale }} className="size-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
    </span>
  );
}

export default function JourneyRail({ progress }: JourneyRailProps) {
  return (
    <div className="pointer-events-none absolute bottom-[18vh] right-8 top-[18vh] hidden md:block" aria-hidden>
      <div className="absolute bottom-0 right-[3px] top-0 w-px bg-white/10" />
      <motion.div style={{ scaleY: progress }} className="absolute bottom-0 right-[3px] top-0 w-px origin-top bg-gradient-to-b from-red-400 to-violet-400" />
      {journeyStations.map((s) => (
        <RailDot key={s.key} progress={progress} at={s.from} to={s.to} label={s.kicker} />
      ))}
    </div>
  );
}
