import { CalendarCheck } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import type { ExpiringContract, UrgencyGroup } from "../../lib/expiring/expiringTypes";
import { riseIn } from "../../lib/motion/presets";
import { expiringTexts as t } from "../../texts/expiringTexts";
import { GLASS_CARD, GLASS_LABEL } from "../glass/glassStyles";
import ContractCard from "./ContractCard";
import { URGENCY_STYLE } from "./expiringStyles";

interface ContractListProps {
  groups: readonly UrgencyGroup[];
  shown: number;
  total: number;
  window: number;
  filtered: boolean;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onAssign: (contract: ExpiringContract) => void;
}

/** Verträge nach Dringlichkeit gebündelt (dringend zuerst), innerhalb nach der gewählten Sortierung. */
export default function ContractList({ groups, shown, total, window, filtered, expandedId, onToggle, onAssign }: ContractListProps) {
  return (
    <motion.section variants={riseIn} aria-label={t.list} className="space-y-6">
      <h3 className={cn(GLASS_LABEL, "pb-0")}>{t.shown(shown, total)}</h3>
      {groups.length === 0 && (
        <div className={cn(GLASS_CARD, "px-4 py-8 text-center")}>
          <CalendarCheck aria-hidden className="mx-auto h-9 w-9 text-slate-300 dark:text-white/20" />
          <p className="mt-2 text-[14px] font-medium text-foreground">{t.empty}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{filtered ? t.emptyFiltered : t.emptyAll(window)}</p>
        </div>
      )}
      {groups.map((g) => (
        <div key={g.urgency}>
          <h4 className={cn(GLASS_LABEL, "flex items-center gap-2")}>
            <span aria-hidden className={cn("h-2 w-2 rounded-full", URGENCY_STYLE[g.urgency].dot)} />
            {t.group(t.urgency[g.urgency], t.urgencyRange[g.urgency], g.contracts.length)}
          </h4>
          <ul className="space-y-2.5">
            {g.contracts.map((c) => (
              <ContractCard key={c.id} contract={c} window={window} expanded={expandedId === c.id} onToggle={onToggle} onAssign={onAssign} />
            ))}
          </ul>
        </div>
      ))}
    </motion.section>
  );
}
