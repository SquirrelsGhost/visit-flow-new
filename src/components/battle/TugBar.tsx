// Füllt den Balken mit einer Feder zur neuen Stelle, wenn ein Sale dazukommt
"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { DuelSide } from "../../lib/battle/duel";

interface TugBarProps {
  /** Anteil der linken Seite, 0 bis 1. */
  share: number;
  leader: DuelSide | null;
  label: string;
  onDeep?: boolean;
  className?: string;
}

/**
 * Tauziehen-Balken eines Duells: links Rot, rechts Blau, am Treffpunkt sprüht ein Funke.
 * Wer führt, schiebt die Grenze zur Gegenseite.
 */
export default function TugBar({ share, leader, label, onDeep = false, className }: TugBarProps) {
  const reduce = useReducedMotion();
  const percent = `${share * 100}%`;
  return (
    <div role="img" aria-label={label} className={cn("relative h-2.5", className)}>
      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-full bg-gradient-to-l from-sky-400 to-blue-500",
          leader === "right" && "shadow-[0_0_16px_-2px_rgba(59,130,246,0.75)]",
          leader === "left" && "shadow-[0_0_16px_-2px_rgba(239,68,68,0.75)]",
          !leader && (onDeep ? "opacity-90" : "opacity-80"),
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-red-500"
          initial={reduce ? false : { width: "50%" }}
          animate={{ width: percent }}
          transition={SOFT_SPRING}
        />
      </div>
      <motion.span
        aria-hidden
        className="absolute top-1/2 h-4 w-4"
        initial={reduce ? false : { left: "50%" }}
        animate={{ left: percent }}
        transition={SOFT_SPRING}
      >
        <span className="arena-spark absolute top-1/2 left-1/2 h-4 w-4 rounded-full bg-[radial-gradient(closest-side,#fff,rgba(253,230,138,0.9)_45%,transparent)] -translate-x-1/2 -translate-y-1/2" />
      </motion.span>
    </div>
  );
}
