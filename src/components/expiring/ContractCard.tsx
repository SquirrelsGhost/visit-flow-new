// Aufklappen und Höhen-Animation brauchen den Browser
"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { formatEuro } from "../../lib/crm/crmFormat";
import type { ExpiringContract } from "../../lib/expiring/expiringTypes";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { expiringTexts as t } from "../../texts/expiringTexts";
import GlassChip from "../glass/GlassChip";
import { GLASS_CARD } from "../glass/glassStyles";
import ContractDetails from "./ContractDetails";
import DaysRing from "./DaysRing";
import { formatDay } from "../../lib/expiring/formatDay";

interface ContractCardProps {
  contract: ExpiringContract;
  window: number;
  expanded: boolean;
  onToggle: (id: string) => void;
  onAssign: (contract: ExpiringContract) => void;
}

/** Ein auslaufender Vertrag als Glaskarte: Restlaufzeit-Ring, Kunde, Kategorie, Ort und Ablauf, rechts die Provision. */
export default function ContractCard({ contract: c, window, expanded, onToggle, onAssign }: ContractCardProps) {
  return (
    <motion.li layout="position" transition={SOFT_SPRING} className="list-none">
      <article className={cn(GLASS_CARD, "relative", c.urgency === "urgent" && "ring-1 ring-inset ring-red-500/25")}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${c.customerName}, ${t.days(c.daysLeft)} – ${expanded ? t.collapse : t.expand}`}
          onClick={() => onToggle(c.id)}
          className="flex w-full items-center gap-3 py-3 pl-3.5 pr-4 text-left focus:outline-none focus-visible:bg-[var(--glass-hover)]"
        >
          <DaysRing daysLeft={c.daysLeft} urgency={c.urgency} window={window} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">{c.customerName}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
              <GlassChip>{t.categoryLabel(c.category)}</GlassChip>
              {c.isLead && <GlassChip tone={c.advisorId ? "green" : "amber"}>{c.advisorName ? t.advisorChip(c.advisorName) : t.lead}</GlassChip>}
              <span className="whitespace-nowrap tabular-nums">{[c.city, t.expiresOn(formatDay(c.expiryDate))].filter(Boolean).join(" · ")}</span>
            </span>
          </span>
          <span className="shrink-0 text-[15px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatEuro(c.commissionEuro)}</span>
          <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-white/35", expanded && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
              <ContractDetails contract={c} onAssign={() => onAssign(c)} />
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.li>
  );
}
