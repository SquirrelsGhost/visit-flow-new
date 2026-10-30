import { Package } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import type { CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { riseIn } from "../../lib/motion/presets";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import { GLASS_CARD, GLASS_LABEL } from "../glass/glassStyles";
import CustomerCard, { type CustomerHandlers } from "./CustomerCard";

interface CustomerListProps extends CustomerHandlers {
  groups: readonly CustomerGroup[];
  visible: number;
  shownSales: number;
  totalSales: number;
  filtered: boolean;
  expandedId: string | null;
  selecting: boolean;
  selectedIds: ReadonlySet<string>;
  onSelecting: (on: boolean) => void;
  onMore: () => void;
}

const PILL = "rounded-full px-3 py-1 text-[12px] font-semibold normal-case tracking-normal transition-colors duration-200";

function selectionOf(group: CustomerGroup, ids: ReadonlySet<string>) {
  const n = group.sales.filter((s) => ids.has(s.id)).length;
  return n === 0 ? "none" : n === group.sales.length ? "all" : "some";
}

/** Kunden der Filter mit Anzahl, Auswahlmodus und "Mehr laden" (v1: 50 auf einmal). */
export default function CustomerList({ groups, visible, shownSales, totalSales, filtered, expandedId, selecting, selectedIds, onSelecting, onMore, ...handlers }: CustomerListProps) {
  const rest = groups.length - visible;
  return (
    <motion.section variants={riseIn} aria-label={t.list}>
      <h3 className={cn(GLASS_LABEL, "flex items-center justify-between gap-2")}>
        <span className="truncate">{t.shown(shownSales, totalSales)}</span>
        {groups.length > 0 && (
          <button type="button" onClick={() => onSelecting(!selecting)} className={cn(PILL, selecting ? "bg-red-500 text-white" : "glass-surface text-slate-600 hover:text-foreground dark:text-white/70")}>
            {selecting ? t.done : t.select}
          </button>
        )}
      </h3>
      {groups.length === 0 ? (
        <div className={cn(GLASS_CARD, "px-4 py-8 text-center")}>
          <Package aria-hidden className="mx-auto h-9 w-9 text-slate-300 dark:text-white/20" />
          <p className="mt-2 text-[14px] font-medium text-foreground">{t.empty}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{filtered ? t.emptyFiltered : t.emptyAll}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {groups.slice(0, visible).map((group) => (
            <CustomerCard key={group.doorId} group={group} expanded={expandedId === group.doorId} selecting={selecting} selection={selectionOf(group, selectedIds)} {...handlers} />
          ))}
        </ul>
      )}
      {rest > 0 && (
        <button type="button" onClick={onMore} className={cn(GLASS_CARD, "mt-2.5 block w-full py-3 text-center text-[13.5px] font-semibold text-foreground transition-colors hover:bg-[var(--glass-hover)]")}>
          {t.more(Math.min(rest, 50))}
        </button>
      )}
    </motion.section>
  );
}
