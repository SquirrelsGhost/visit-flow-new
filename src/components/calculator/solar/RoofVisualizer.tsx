// Module erscheinen nacheinander, die Sonne folgt der Ausrichtung
"use client";

import { Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/cn";
import type { Orientation } from "../../../lib/solar/solarCalc";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { solarTexts as t } from "../../../texts/solarTexts";
import { GLASS_CARD } from "../../glass/glassStyles";

interface RoofVisualizerProps {
  panels: number;
  kWp: number;
  orientation: Orientation;
}

const SUN: Record<Orientation, { scale: number; opacity: number; className: string }> = {
  south: { scale: 1.1, opacity: 1, className: "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" },
  "east-west": { scale: 0.9, opacity: 0.8, className: "text-amber-600/80 dark:text-amber-500/80" },
  north: { scale: 0.75, opacity: 0.4, className: "text-slate-400 dark:text-slate-600" },
};

/** Dach mit bis zu 12 sichtbaren Modulen und Sonne je nach Ausrichtung (v1 Dach-Modulbelegung). */
export default function RoofVisualizer({ panels, kWp, orientation }: RoofVisualizerProps) {
  const sun = SUN[orientation];
  const shown = Math.min(12, panels);
  return (
    <div className={cn(GLASS_CARD, "group/roof relative flex min-h-[170px] shrink-0 flex-col items-center justify-center p-4")}>
      <span className="absolute left-4 top-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]">{t.roofLabel}</span>
      <motion.div className={cn("absolute right-4 top-3", sun.className)} animate={{ scale: sun.scale, opacity: sun.opacity }} transition={{ duration: 0.5 }}>
        <Sun className={cn("h-8 w-8", orientation === "south" && "motion-safe:animate-[spin_24s_linear_infinite]")} />
      </motion.div>
      <div className="mt-6 flex w-full max-w-[200px] flex-col items-center">
        <div className="relative flex h-0 w-0 justify-center border-b-[80px] border-l-[90px] border-r-[90px] border-b-slate-200 border-l-transparent border-r-transparent dark:border-b-slate-800">
          <div className="absolute top-[12px] flex w-[115px] justify-center">
            <div className="grid grid-cols-4 justify-center gap-0.5 rounded-sm border border-slate-300 bg-slate-100/80 p-1 dark:border-slate-700/30 dark:bg-slate-900/60">
              <AnimatePresence initial={false}>
                {Array.from({ length: shown }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ ...SNAPPY_SPRING, delay: i * 0.02 }}
                    className="relative h-5 w-3.5 shrink-0 overflow-hidden rounded-sm border border-blue-400/30 bg-gradient-to-br from-blue-600 to-indigo-900 shadow-sm"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/roof:translate-x-full" />
                    <div className="absolute left-1/2 h-full w-px bg-blue-400/20" />
                    <div className="absolute top-1/2 h-px w-full bg-blue-400/20" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex h-[35px] w-[160px] items-end justify-around rounded-b-md border-t border-slate-300/40 bg-slate-200 px-4 pb-1 dark:border-t-slate-700/40 dark:bg-slate-800">
          <div className="h-6 w-3.5 rounded-t-sm bg-slate-300 dark:bg-slate-900" />
          <div className="h-4 w-4 rounded-sm bg-slate-300 dark:bg-slate-900" />
          <div className="h-4 w-4 rounded-sm bg-slate-300 dark:bg-slate-900" />
        </div>
      </div>
      <span className="mt-3 text-[10px] font-bold text-muted-foreground">{t.roofCaption(kWp, panels)}</span>
    </div>
  );
}
