import { Inbox } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import type { StatusTab } from "../../lib/backoffice/backofficeTypes";
import type { CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { riseIn } from "../../lib/motion/presets";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassFilterChips from "../glass/GlassFilterChips";
import { GLASS_CARD, GLASS_LABEL } from "../glass/glassStyles";
import BackofficeCard, { type BackofficeHandlers } from "./BackofficeCard";

interface BackofficeListProps extends BackofficeHandlers {
  status: StatusTab;
  counts: Record<StatusTab, number>;
  onStatus: (status: StatusTab) => void;
  groups: readonly CustomerGroup[];
  visible: number;
  expandedId: string | null;
  selecting: boolean;
  selectedIds: ReadonlySet<string>;
  busy: boolean;
  onSelecting: (on: boolean) => void;
  onMore: () => void;
}

const TABS: readonly StatusTab[] = ["open", "completed", "cancelled", "all"];
const PILL = "rounded-full px-3 py-1 text-[12px] font-semibold normal-case tracking-normal transition-colors duration-200";

function selectionOf(group: CustomerGroup, ids: ReadonlySet<string>) {
  const n = group.sales.filter((s) => ids.has(s.id)).length;
  return n === 0 ? "none" : n === group.sales.length ? "all" : "some";
}

/** Status-Reiter mit Zahlen, darüber die Kunden der Filter; Auswahlmodus für Sammelentscheidungen. */
export default function BackofficeList({ status, counts, onStatus, groups, visible, expandedId, selecting, selectedIds, busy, onSelecting, onMore, ...handlers }: BackofficeListProps) {
  const rest = groups.length - visible;
  return (
    <motion.section variants={riseIn} aria-label={t.list} className="space-y-4">
      <GlassFilterChips label={t.tabsLabel} layoutId="backoffice-status" options={TABS.map((id) => ({ id, label: t.tabs[id], count: counts[id] }))} active={status} onChange={onStatus} />
      <div>
        <h3 className={cn(GLASS_LABEL, "flex items-center justify-between gap-2")}>
          <span className="truncate">{t.shown(groups.length)}</span>
          {groups.length > 0 && (
            <button type="button" onClick={() => onSelecting(!selecting)} className={cn(PILL, selecting ? "bg-red-500 text-white" : "glass-surface text-slate-600 hover:text-foreground dark:text-white/70")}>
              {selecting ? t.done : t.select}
            </button>
          )}
        </h3>
        {groups.length === 0 ? (
          <div className={cn(GLASS_CARD, "px-4 py-10 text-center")}>
            <Inbox aria-hidden className="mx-auto h-9 w-9 text-slate-300 dark:text-white/20" />
            <p className="mt-2 text-[14px] font-medium text-foreground">{t.empty[status]}</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{t.emptyHint}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {groups.slice(0, visible).map((group) => (
              <BackofficeCard key={group.doorId} group={group} expanded={expandedId === group.doorId} selecting={selecting} selection={selectionOf(group, selectedIds)} busy={busy} {...handlers} />
            ))}
          </ul>
        )}
        {rest > 0 && (
          <button type="button" onClick={onMore} className={cn(GLASS_CARD, "mt-2.5 block w-full py-3 text-center text-[13.5px] font-semibold text-foreground transition-colors hover:bg-[var(--glass-hover)]")}>
            {t.more(Math.min(rest, 30))}
          </button>
        )}
      </div>
    </motion.section>
  );
}
