import { PartyPopper } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { round2 } from "../../lib/abrechnung/abrechnungFormat";
import { openGroups } from "../../lib/abrechnung/abrechnungSummary";
import type { AbrechnungItem, MonthRef } from "../../lib/abrechnung/abrechnungTypes";
import { cn } from "../../lib/cn";
import { riseIn, staggerParent } from "../../lib/motion/presets";
import { eur } from "../../lib/tariff/eur";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import AnimatedEuro from "../ui/AnimatedEuro";
import { CARD } from "./abrechnungStyles";
import OpenItemCard from "./OpenItemCard";

/** So viele Punkte je Gruppe sind sofort sichtbar, der Rest klappt auf. */
const PREVIEW = 3;

interface OpenItemsSectionProps {
  open: AbrechnungItem[];
  current: MonthRef;
  selectedIds: readonly string[];
  allSelected: boolean;
  selectableCount: number;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onTakeOver: (item: AbrechnungItem) => void;
  onClaim: (item: AbrechnungItem) => void;
}

/** Offene Punkte aus allen Monaten, auch ohne Upload sichtbar (v1), mit Summe je Gruppe. */
export default function OpenItemsSection({ open, current, selectedIds, allSelected, selectableCount, onToggle, onToggleAll, onTakeOver, onClaim }: OpenItemsSectionProps) {
  const groups = openGroups(open);
  const [expanded, setExpanded] = useState<string[]>([]);
  const unpaid = round2(groups.filter((g) => g.key !== "untracked").reduce((s, g) => s + g.total, 0));

  if (!groups.length) {
    return (
      <motion.section variants={riseIn} className={cn(CARD, "flex items-center gap-3 p-4")}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <PartyPopper className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{t.allClear}</p>
      </motion.section>
    );
  }

  return (
    <motion.section variants={riseIn} aria-labelledby="abr-open" className="space-y-3 pt-1">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 id="abr-open" className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white">
            {t.openTitle} <span className="font-normal text-slate-400">{open.length}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400">{t.openHint}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-rose-600 tabular-nums dark:text-rose-400">
            <AnimatedEuro value={unpaid} from={0} duration={0.9} />
          </p>
          {selectableCount > 1 && (
            <button type="button" onClick={onToggleAll} className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {allSelected ? t.selectNone : t.selectAll}
            </button>
          )}
        </div>
      </div>
      {groups.map((g) => (
        <div key={g.key} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3 px-1 pt-1">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <span className={cn("h-2 w-2 rounded-full", g.dot)} aria-hidden="true" />
                {g.title} <span className="font-normal text-slate-400">· {g.items.length}</span>
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">{g.hint}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-slate-600 tabular-nums dark:text-neutral-300">{eur(g.total)}</span>
          </div>
          <motion.ul variants={staggerParent(0.04, 0)} initial="hidden" animate="show" className="space-y-2">
            {(expanded.includes(g.key) ? g.items : g.items.slice(0, PREVIEW)).map((item) => (
              <OpenItemCard
                key={item._id}
                item={item}
                current={current}
                selected={selectedIds.includes(item._id)}
                selectionActive={selectedIds.length > 0}
                onToggle={() => onToggle(item._id)}
                onTakeOver={() => onTakeOver(item)}
                onClaim={() => onClaim(item)}
              />
            ))}
          </motion.ul>
          {g.items.length > PREVIEW && (
            <button
              type="button"
              aria-expanded={expanded.includes(g.key)}
              onClick={() => setExpanded((e) => (e.includes(g.key) ? e.filter((k) => k !== g.key) : [...e, g.key]))}
              className="w-full rounded-xl py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-white/60 dark:text-emerald-400 dark:hover:bg-white/[0.04]"
            >
              {expanded.includes(g.key) ? t.showLess : t.showAll(g.items.length)}
            </button>
          )}
        </div>
      ))}
    </motion.section>
  );
}
