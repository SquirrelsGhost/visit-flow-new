import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { staggerParent } from "../../lib/motion/presets";
import { GLASS_BODY, GLASS_BODY_WIDE } from "./glassStyles";

/** stack: eine Spalte. wide: ab iPad quer volle Breite für feste Raster (GlassSplit, GlassPair). */
export type GlassBodyLayout = "stack" | "wide";

interface GlassBodyProps {
  layout?: GlassBodyLayout;
  children: ReactNode;
}

/** Inhaltsspalte einer Glas-Seite: die Karten steigen nacheinander weich auf. */
export default function GlassBody({ layout = "stack", children }: GlassBodyProps) {
  return (
    <motion.div className={cn(GLASS_BODY, layout === "wide" && GLASS_BODY_WIDE)} variants={staggerParent(0.07, 0.05)} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
