import { motion } from "motion/react";
import type { FamilySlice } from "../../lib/abrechnung/abrechnungBreakdown";
import { round2 } from "../../lib/abrechnung/abrechnungFormat";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { CARD, CARD_TITLE, MUTED } from "./abrechnungStyles";
import DonutChart from "./DonutChart";

interface BreakdownCardProps {
  slices: FamilySlice[];
  active: string | null;
  onToggle: (key: string) => void;
}

/** Aufteilung des Monats nach Produkt. Ein Tipp auf eine Familie filtert die Positionen darunter. */
export default function BreakdownCard({ slices, active, onToggle }: BreakdownCardProps) {
  const total = round2(slices.reduce((s, f) => s + f.amount, 0));
  return (
    <motion.section variants={riseIn} className={cn(CARD, "p-5")} aria-labelledby="abr-breakdown">
      <h2 id="abr-breakdown" className={CARD_TITLE}>
        {t.breakdownTitle}
      </h2>
      <p className={MUTED}>{`${t.breakdownHint} · ${t.breakdownFilter}`}</p>
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <DonutChart slices={slices} active={active} total={total} label={t.breakdownTitle} />
        <ul className="w-full min-w-0 flex-1 space-y-1">
          {slices.map((s) => {
            const on = active === s.key;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle(s.key)}
                  className={cn(
                    "group w-full rounded-xl px-2.5 py-2 text-left transition-[background-color,opacity] duration-300",
                    on ? "bg-slate-100 dark:bg-white/[0.06]" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]",
                    active !== null && !on && "opacity-55",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-neutral-100">{s.label}</span>
                    <span className="text-xs text-slate-400 tabular-nums">{`${Math.round(s.share * 100)} %`}</span>
                    <span className="w-20 text-right text-sm font-semibold text-slate-900 tabular-nums dark:text-white">{eur(s.amount)}</span>
                  </span>
                  <span className="mt-1.5 ml-5 block h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.05]">
                    <motion.span
                      className="block h-full origin-left rounded-full"
                      style={{ backgroundColor: s.color }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: s.share }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                  <span className="mt-1 ml-5 block text-[11px] text-slate-400 dark:text-neutral-500">{t.positionsCount(s.count)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.section>
  );
}
