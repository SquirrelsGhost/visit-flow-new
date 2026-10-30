import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_FOOTER, GLASS_LABEL } from "./glassStyles";

interface GlassSectionProps {
  label?: string;
  /** Erklärung unter der Karte. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Gruppe zusammengehöriger Zeilen: leise Überschrift, Glaskarte mit feinen Trennlinien, Fußnote. In einer GlassPair wächst die Karte auf Zeilenhöhe. */
export default function GlassSection({ label, footer, children }: GlassSectionProps) {
  return (
    <motion.section variants={riseIn} className="flex flex-col">
      {label && <h3 className={GLASS_LABEL}>{label}</h3>}
      <div className={cn(GLASS_CARD, GLASS_DIVIDER, "flex-1")}>{children}</div>
      {footer && <div className={GLASS_FOOTER}>{footer}</div>}
    </motion.section>
  );
}
