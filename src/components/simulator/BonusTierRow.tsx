import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn";
import { euroWhole } from "../../lib/simulator/simulatorFormat";
import type { BonusRow } from "../../lib/simulator/telcoBonus";
import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import { MONEY } from "./simulatorStyles";

interface BonusTierRowProps {
  row: BonusRow;
}

const TRACK = "relative mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--glass-track)]";

/** Eine Bonuskategorie: Stückzahl, Balken bis zur höchsten Stufe mit Stufenmarken, Stufen-Chips. */
export default function BonusTierRow({ row }: BonusTierRowProps) {
  const { category, count, progress } = row;
  const reduce = useReducedMotion();
  const max = category.tiers[category.tiers.length - 1]?.target ?? 1;
  const width = Math.min(100, (count / max) * 100);
  const next = category.tiers.find((tier) => count < tier.target);
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[14px] font-medium text-foreground">{category.name}</span>
        <span className={cn("shrink-0 text-[13px] font-semibold", MONEY, progress.amount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400")}>
          {progress.amount > 0 ? `+${euroWhole(progress.amount)}` : fill(t.bonus.pieces, { count })}
        </span>
      </div>
      <div className={TRACK}>
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", category.gradient)}
          initial={false}
          animate={{ width: `${width}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 26 }}
        />
        {category.tiers.slice(0, -1).map((tier) => (
          <span key={tier.stufe} aria-hidden className="absolute top-0 h-full w-px bg-white/70 dark:bg-black/40" style={{ left: `${(tier.target / max) * 100}%` }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {category.tiers.map((tier) => {
          const reached = count >= tier.target;
          const amount = tier.perProduct ? fill(t.bonus.perPiece, { amount: euroWhole(tier.bonusAmount) }) : euroWhole(tier.bonusAmount);
          return (
            <span
              key={tier.stufe}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold transition-colors duration-300",
                MONEY,
                reached ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-[var(--glass-track)] text-slate-500 dark:text-white/50",
              )}
            >
              {fill(t.bonus.stage, { stufe: tier.stufe, target: tier.target })} → {amount}
            </span>
          );
        })}
        <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">
          {next ? fill(t.bonus.toNext, { count: next.target - count, stufe: next.stufe }) : t.bonus.top}
        </span>
      </div>
    </div>
  );
}
