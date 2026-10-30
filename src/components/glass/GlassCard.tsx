import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import GlassSheen from "./GlassSheen";
import GlassSpotlight from "./GlassSpotlight";
import { GLASS_CARD, GLASS_DEEP } from "./glassStyles";

interface GlassCardProps {
  /** "glass": helle, durchscheinende Fläche. "deep": tiefe, dunkle Karte mit Farblichtern (Kopf, Lizenzen). */
  variant?: "glass" | "deep";
  /** Einmaliger Lichtstreif beim Erscheinen. */
  sheen?: boolean;
  /** Lichtkegel, der der Maus folgt (nur Desktop). */
  spotlight?: boolean;
  className?: string;
  children: ReactNode;
}

/** Grundfläche des Glas-Designs; steigt als Teil einer Staffel weich auf. */
export default function GlassCard({ variant = "glass", sheen = false, spotlight = false, className, children }: GlassCardProps) {
  return (
    <motion.section variants={riseIn} className={cn(variant === "deep" ? GLASS_DEEP : GLASS_CARD, className)}>
      {spotlight && <GlassSpotlight />}
      {sheen && <GlassSheen />}
      {children}
    </motion.section>
  );
}
