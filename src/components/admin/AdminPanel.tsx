import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { GLASS_CARD, GLASS_FOOTER, GLASS_LABEL } from "../glass/glassStyles";

interface AdminPanelProps {
  label: string;
  /** Kleiner Inhalt rechts neben der Überschrift (Plakette, Zähler). */
  aside?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Kennzahlen-Karte des Dashboards: leise Überschrift, freie Glasfläche, Fußnote; wie GlassSection, nur ohne Zeilen. */
export default function AdminPanel({ label, aside, footer, className, children }: AdminPanelProps) {
  return (
    <motion.section variants={riseIn}>
      <div className="flex items-end justify-between gap-3">
        <h3 className={GLASS_LABEL}>{label}</h3>
        {aside && <div className="pb-2">{aside}</div>}
      </div>
      <div className={cn(GLASS_CARD, "p-4", className)}>{children}</div>
      {footer && <div className={GLASS_FOOTER}>{footer}</div>}
    </motion.section>
  );
}
