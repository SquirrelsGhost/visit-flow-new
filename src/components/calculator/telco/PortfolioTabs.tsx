// Gleitende Markierung des aktiven Portfolios
"use client";

import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import type { Portfolio } from "../../../lib/tariff/telcoTypes";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import { CALC_PILL, CALC_TRACK } from "../calcGlass";

interface PortfolioTabsProps {
  value: Portfolio;
  onChange: (p: Portfolio) => void;
}

const TABS: { id: Portfolio; text: string }[] = [
  { id: "kabel-neu", text: "text-blue-600 dark:text-blue-300" },
  { id: "kabel-upsell", text: "text-purple-600 dark:text-purple-300" },
  { id: "glasfaser", text: "text-amber-600 dark:text-amber-300" },
  { id: "dsl", text: "text-emerald-600 dark:text-emerald-300" },
];

/** Kabel Neu, Upsell, Glasfaser, DSL als gläserne Segment-Steuerung. Auf dem Handy mit Kurznamen. */
export default function PortfolioTabs({ value, onChange }: PortfolioTabsProps) {
  return (
    <div role="tablist" className={CALC_TRACK}>
      {TABS.map(({ id, text }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={t.portfolios[id]}
            onClick={() => onChange(id)}
            className={cn(
              "relative h-10 flex-1 rounded-xl px-2 text-[13px] font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
              active ? text : "text-slate-500 hover:text-foreground dark:text-white/50 dark:hover:text-white",
            )}
          >
            {active && <motion.span layoutId="portfolio-pill" transition={SNAPPY_SPRING} className={CALC_PILL} />}
            <span className="relative">
              <span className="hidden md:inline">{t.portfolios[id]}</span>
              <span className="md:hidden">{t.portfolioShort[id]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
