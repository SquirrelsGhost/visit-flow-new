import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SOFT_SPRING } from "../../lib/motion/presets";

interface FadeSwapProps {
  children: ReactNode;
}

/** Inhalt eines Reiters: blendet beim Wechsel weich von leicht unten ein. */
export default function FadeSwap({ children }: FadeSwapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={SOFT_SPRING}
    >
      {children}
    </motion.div>
  );
}
