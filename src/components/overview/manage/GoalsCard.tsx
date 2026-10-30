import { Pencil, Sigma, Target } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { PRODUCT_GROUP_META } from "../../../lib/overview/productGroups";
import type { GoalLine } from "../../../lib/overview/teamGoals";
import type { ProductCategory } from "../../../lib/map/productMeta";
import { riseIn } from "../../../lib/motion/presets";
import { manageTexts } from "../../../texts/manageTexts";
import GlassIcon from "../../glass/GlassIcon";
import GlassProgress from "../../glass/GlassProgress";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";

interface GoalsCardProps {
  lines: readonly GoalLine[];
  /** Anteil des Monats, der schon vorbei ist. */
  plan: number;
  onEdit: () => void;
}

const texts = manageTexts.goals;

function verdict(line: GoalLine, plan: number): { label: string; className: string } {
  if (line.current >= line.target) return { label: texts.done, className: "text-emerald-600 dark:text-emerald-400" };
  if (line.current / line.target >= plan) return { label: texts.onTrack, className: "text-sky-600 dark:text-sky-400" };
  return { label: texts.behind, className: "text-amber-600 dark:text-amber-400" };
}

/** Monatsziele des Teams mit Fortschritt; der feine Strich zeigt den Soll-Stand nach Kalender. */
export default function GoalsCard({ lines, plan, onEdit }: GoalsCardProps) {
  if (lines.length === 0) {
    return (
      <GlassSection label={texts.label}>
        <GlassRow icon={Target} tone="indigo" title={texts.empty} subtitle={texts.emptyHint} onClick={onEdit} />
      </GlassSection>
    );
  }
  return (
    <GlassSection label={texts.label} footer={texts.footer}>
      {lines.map((line) => {
        const meta = PRODUCT_GROUP_META[line.category as ProductCategory];
        const v = verdict(line, plan);
        return (
          <motion.div key={line.category} variants={riseIn} className="flex items-center gap-3.5 px-4 py-3.5">
            <GlassIcon icon={meta?.icon ?? Sigma} tone={meta?.tone ?? "red"} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[15px] font-semibold text-foreground">{meta?.label ?? texts.total}</span>
                <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{line.current}</span> / {line.target}
                </span>
              </div>
              <div className="relative mt-2">
                <GlassProgress share={line.current / line.target} label={meta?.label ?? texts.total} tone={meta?.tone ?? "red"} now={line.current} max={line.target} />
                <span aria-hidden className="absolute -top-0.5 h-2.5 w-0.5 rounded-full bg-foreground/40" style={{ left: `${Math.min(plan, 1) * 100}%` }} />
              </div>
              <span className={cn("mt-1.5 block text-[11.5px] font-semibold", v.className)}>{v.label}</span>
            </div>
          </motion.div>
        );
      })}
      <GlassRow icon={Pencil} tone="gray" title={texts.edit} onClick={onEdit} />
    </GlassSection>
  );
}
