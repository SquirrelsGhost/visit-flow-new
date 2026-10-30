import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface CollapseProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

/** Klappt Inhalt weich auf und zu (Höhe und Deckkraft), statt wie in v1 über max-height zu springen. */
export default function Collapse({ open, children, className }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.25 } }}
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
