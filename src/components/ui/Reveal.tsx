// Ein- und Ausklappen mit motion
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface RevealProps {
  show: boolean;
  children: ReactNode;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Klappt Inhalt weich auf und zu, statt ihn hart ein- und auszublenden (Bewegung reduziert: nur Blende). */
export default function Reveal({ show, children, className }: RevealProps) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          className={cn("overflow-hidden", className)}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
          exit={{ height: 0, opacity: 0, overflow: "hidden" }}
          transition={{ duration: 0.38, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
