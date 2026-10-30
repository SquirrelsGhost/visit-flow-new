import { motion } from "motion/react";
import type { ReactNode } from "react";
import { riseIn } from "../../lib/motion/presets";

interface OrgActionsProps {
  /** GlassQuickAction-Knöpfe, je nach Rolle. */
  children: ReactNode;
}

/** Reihe runder Schnellknöpfe unter der Kopfkarte. */
export default function OrgActions({ children }: OrgActionsProps) {
  return (
    <motion.div variants={riseIn} className="flex gap-2 px-1">
      {children}
    </motion.div>
  );
}
