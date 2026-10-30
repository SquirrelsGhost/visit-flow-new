import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import type { SaleTab } from "../../../lib/map/saleCatalog";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";

interface MapSaleTabsProps {
  tabs: SaleTab[];
  value: string;
  onChange: (id: string) => void;
  /** Eindeutig je Liste, damit die Markierung nicht zwischen Listen springt. */
  layoutId: string;
}

/** Reiter wie Kabel / Glasfaser / DSL; die Markierung gleitet zum gewählten Reiter. */
export default function MapSaleTabs({ tabs, value, onChange, layoutId }: MapSaleTabsProps) {
  return (
    <div role="tablist" className="mb-3 flex gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 rounded-xl px-2 py-2 text-xs font-bold transition-colors",
              active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-white/50",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={SNAPPY_SPRING}
                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-white/15"
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
