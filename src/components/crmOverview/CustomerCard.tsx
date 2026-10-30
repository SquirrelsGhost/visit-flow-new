// Aufklappen und Höhen-Animation brauchen den Browser
"use client";

import { AlertTriangle, Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { formatEuro } from "../../lib/crm/crmFormat";
import type { AdminSale, CustomerGroup } from "../../lib/crmOverview/overviewTypes";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import GlassChip from "../glass/GlassChip";
import { GLASS_CARD } from "../glass/glassStyles";
import CustomerDetails from "./CustomerDetails";

export interface CustomerHandlers {
  onToggle: (doorId: string) => void;
  onSelect: (group: CustomerGroup) => void;
  onDeleteSale: (group: CustomerGroup, sale: AdminSale) => void;
  onDeleteGroup: (group: CustomerGroup) => void;
}

interface CustomerCardProps extends CustomerHandlers {
  group: CustomerGroup;
  expanded: boolean;
  /** Auswahlmodus: Tippen wählt statt aufzuklappen. */
  selecting: boolean;
  /** "all", "some" oder "none" der Produkte gewählt. */
  selection: "all" | "some" | "none";
}

const DATE = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

function Check3({ state }: { state: CustomerCardProps["selection"] }) {
  return (
    <span aria-hidden className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 ring-inset transition-colors duration-200", state === "none" ? "ring-slate-300 dark:ring-white/25" : "bg-red-500 text-white ring-red-500")}>
      {state === "all" && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {state === "some" && <span className="h-0.5 w-2.5 rounded-full bg-white" />}
    </span>
  );
}

/** Ein Kunde als Glaskarte (v1 Akkordeon): Name, Verkäufer, Datum und Provision; roter Rand bei Problemen. */
export default function CustomerCard({ group, expanded, selecting, selection, onToggle, onSelect, onDeleteSale, onDeleteGroup }: CustomerCardProps) {
  const label = selecting ? t.selectCustomer(group.customerName) : `${group.customerName} – ${expanded ? t.collapse : t.expand}`;
  return (
    <motion.li layout="position" transition={SOFT_SPRING} className="list-none">
      <article className={cn(GLASS_CARD, "relative transition-shadow duration-300", group.issue && "ring-1 ring-inset ring-red-500/35", selection !== "none" && "ring-2 ring-inset ring-red-500/70")}>
        {group.issue && <span aria-hidden className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-red-500" />}
        <button
          type="button"
          aria-expanded={selecting ? undefined : expanded}
          aria-pressed={selecting ? selection === "all" : undefined}
          aria-label={label}
          onClick={() => (selecting ? onSelect(group) : onToggle(group.doorId))}
          className="flex w-full items-start gap-3 py-3.5 pl-5 pr-4 text-left focus:outline-none focus-visible:bg-[var(--glass-hover)]"
        >
          {selecting && <Check3 state={selection} />}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">{group.customerName}</span>
              {group.issue && <AlertTriangle aria-label={t.issue[group.issue]} className="h-3.5 w-3.5 shrink-0 text-red-500" />}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
              <GlassChip>{t.productCount(group.sales.length)}</GlassChip>
              {group.issue && <GlassChip tone="red">{t.issue[group.issue]}</GlassChip>}
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
              <CustomerDetails group={group} onDeleteSale={(s) => onDeleteSale(group, s)} onDeleteGroup={() => onDeleteGroup(group)} />
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.li>
  );
}
