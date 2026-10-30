// Neue Punkte rollen mit motion von unten herein
"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";

interface RollingScoreProps {
  value: number;
  leads: boolean;
  onDeep?: boolean;
  className?: string;
}

/** Punktzahl eines Duells: jeder neue Punkt rollt herein, der Führende leuchtet golden. */
export default function RollingScore({ value, leads, onDeep = false, className }: RollingScoreProps) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("relative inline-flex overflow-hidden tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: "70%", opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { y: "-70%", opacity: 0 }}
          transition={SNAPPY_SPRING}
          className={cn(leads ? "arena-leader-score" : onDeep ? "text-white/85" : "text-foreground")}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
