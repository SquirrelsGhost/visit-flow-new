import { motion } from "motion/react";
import type { ReactNode } from "react";
import { riseIn } from "../../lib/motion/presets";
import { cn } from "../../lib/cn";

interface ArenaSectionProps {
  /** Kopfzeile (SectionTitle); ohne sie steht nur der Inhalt. */
  title?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Ein Abschnitt der Arena: steigt in der Staffel der Seite auf. Den Abstand setzt GlassBody (28px). */
export default function ArenaSection({ title, className, children }: ArenaSectionProps) {
  return (
    <motion.section variants={riseIn} className={cn(className)}>
      {title}
      {children}
    </motion.section>
  );
}
