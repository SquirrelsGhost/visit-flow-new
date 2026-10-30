import { motion } from "motion/react";
import type { SeatCounts } from "../../lib/licenses/licenseLogic";
import type { SeatFilter } from "../../lib/licenses/licenseTypes";
import { cn } from "../../lib/cn";
import { licenseTexts } from "../../texts/licenseTexts";
import GlassNumber from "../glass/GlassNumber";

interface HeroTilesProps {
  counts: SeatCounts;
}

type Part = Exclude<SeatFilter, "all">;

const PARTS: readonly Part[] = ["active", "pending", "inactive", "free"];
const BAR: Record<Part, string> = {
  active: "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)]",
  pending: "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
  inactive: "bg-slate-400 dark:bg-slate-500",
  free: "bg-transparent",
};
const DOT: Record<Part, string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-400",
  inactive: "bg-slate-400",
  free: "bg-transparent ring-[1.5px] ring-inset ring-slate-400/70 dark:ring-white/40",
};
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Aufteilung der Plätze: ein durchgehender Balken mit Anteilen je Stand (skaliert für jede Menge)
 * und darunter eine ruhige Legende mit den Zahlen. Inaktiv und Eingeladen nur, wenn es sie gibt.
 */
export default function HeroTiles({ counts }: HeroTilesProps) {
  const total = Math.max(1, counts.active + counts.pending + counts.inactive + counts.free);
  const shown = PARTS.filter((p) => p === "active" || p === "free" || counts[p] > 0);
  const filled = PARTS.filter((p) => p !== "free" && counts[p] > 0);
  const starts = filled.map((_, i) => filled.slice(0, i).reduce((sum, p) => sum + counts[p], 0));
  return (
    <div className="relative space-y-3">
      <div aria-hidden className="relative h-2 overflow-hidden rounded-full bg-slate-900/[0.07] dark:bg-white/[0.08]">
        {filled.map((part, index) => {
          const left = (starts[index]! / total) * 100;
          return (
            <motion.span
              key={part}
              className={cn("absolute inset-y-0 rounded-full", BAR[part])}
              style={{ left: `${left}%`, width: `${(counts[part] / total) * 100}%`, transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.35 + index * 0.15 }}
            />
          );
        })}
      </div>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-1.5">
        {shown.map((part) => (
          <div key={part} className="flex items-center gap-2 text-[13px]">
            <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", DOT[part])} />
            <dt className="flex-1 truncate text-muted-foreground">{licenseTexts.hero.tiles[part]}</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              <GlassNumber value={counts[part]} duration={1} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
