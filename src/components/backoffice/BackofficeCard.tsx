// Aufklappen und Höhen-Animation brauchen den Browser
"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { BACKOFFICE_CAN_DELETE } from "../../lib/backoffice/backofficeConfig";
import { actionable } from "../../lib/backoffice/backofficeLogic";
import type { BackofficeAction } from "../../lib/backoffice/backofficeTypes";
import { formatEuro } from "../../lib/crm/crmFormat";
import type { AdminSale, CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import OrderStatusChip from "../crm/OrderStatusChip";
import GlassChip from "../glass/GlassChip";
import { GLASS_CARD } from "../glass/glassStyles";
import BackofficeActions from "./BackofficeActions";
import BackofficeDetails from "./BackofficeDetails";

export interface BackofficeHandlers {
  onToggle: (doorId: string) => void;
  onSelect: (group: CustomerGroup) => void;
  onAction: (action: BackofficeAction, sales: readonly AdminSale[]) => void;
}

interface BackofficeCardProps extends BackofficeHandlers {
  group: CustomerGroup;
  expanded: boolean;
  selecting: boolean;
  selection: "all" | "some" | "none";
  busy: boolean;
}

const DATE = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" });

function Tick({ state }: { state: BackofficeCardProps["selection"] }) {
  return (
    <span aria-hidden className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 ring-inset transition-colors duration-200", state === "none" ? "ring-slate-300 dark:ring-white/25" : "bg-red-500 text-white ring-red-500")}>
      {state === "all" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {state === "some" && <span className="h-0.5 w-2.5 rounded-full bg-white" />}
    </span>
  );
}

/** Ein Kunde mit seinen Produkten. Offene Verkäufe zeigen die Entscheidung direkt auf der Karte, ohne Aufklappen. */
export default function BackofficeCard({ group, expanded, selecting, selection, busy, onToggle, onSelect, onAction }: BackofficeCardProps) {
  const open = actionable(group.sales.filter((s) => s.status === "open"));
  const statuses = new Set(group.sales.map((s) => s.status));
  const single = statuses.size === 1 ? [...statuses][0] : undefined;
  const actions: BackofficeAction[] = BACKOFFICE_CAN_DELETE ? ["complete", "cancel", "delete"] : ["complete", "cancel"];
  return (
    <motion.li layout="position" transition={SOFT_SPRING} className="list-none">
      <article className={cn(GLASS_CARD, "relative transition-shadow duration-300", selection !== "none" && "ring-2 ring-inset ring-red-500/70")}>
        {open.length > 0 && <span aria-hidden className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-amber-400" />}
        <button
          type="button"
          aria-expanded={selecting ? undefined : expanded}
          aria-pressed={selecting ? selection === "all" : undefined}
          aria-label={selecting ? t.selectCustomer(group.customerName) : `${group.customerName} – ${expanded ? t.collapse : t.expand}`}
          onClick={() => (selecting ? onSelect(group) : onToggle(group.doorId))}
          className="flex w-full items-start gap-3 py-3.5 pl-5 pr-4 text-left focus:outline-none focus-visible:bg-[var(--glass-hover)]"
        >
          {selecting && <Tick state={selection} />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">{group.customerName}</span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
              {single ? <OrderStatusChip status={single} /> : <GlassChip tone="amber">{t.openCount(open.length)}</GlassChip>}
              <GlassChip>{t.productCount(group.sales.length)}</GlassChip>
              <span className="truncate">{group.userName}</span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{group.latest ? DATE.format(new Date(group.latest)) : "–"}</span>
            </span>
          </span>
          <span className="shrink-0 pt-0.5 text-[15px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatEuro(group.total)}</span>
          {!selecting && <ChevronDown aria-hidden className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-white/35", expanded && "rotate-180")} />}
        </button>
        <AnimatePresence initial={false}>
          {expanded && !selecting && (
            <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
              <BackofficeDetails group={group} onAction={(a, s) => onAction(a, [s])} />
            </motion.div>
          )}
        </AnimatePresence>
        {!selecting && open.length > 0 && (
          <div className="px-4 pb-4">
            <BackofficeActions actions={actions} many={open.length > 1} disabled={busy} onAction={(a) => onAction(a, a === "delete" ? actionable(group.sales) : open)} />
          </div>
        )}
      </article>
    </motion.li>
  );
}
