// Klappt die Sales-Details auf und rückt beim Filtern weich an den neuen Platz
"use client";

import { ChevronDown, Hand, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { leadingSide } from "../../../lib/battle/battleLogs";
import type { AdminBattle } from "../../../lib/battle/battleTypes";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";
import BattleLogSales from "./BattleLogSales";
import BattleLogSide from "./BattleLogSide";
import BattleStatusBadge from "./BattleStatusBadge";

interface BattleLogRowProps {
  battle: AdminBattle;
  index: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Ein Battle der Historie als Paarung: beide Seiten, Score in der Mitte, Status und Art. Tippen zeigt die Sales. */
export default function BattleLogRow({ battle: b, index }: BattleLogRowProps) {
  const [open, setOpen] = useState(false);
  const lead = leadingSide(b);
  const done = b.status === "completed";
  const sickId = b.status === "cancelled_sick" ? b.sickUserId : undefined;
  const TypeIcon = b.isAutoAssigned ? Zap : Hand;
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { ...SOFT_SPRING, delay: Math.min(index, 8) * 0.04 } }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
      className="glass-surface overflow-hidden rounded-[24px] ring-1 ring-slate-200/70 transition-shadow duration-300 hover:shadow-[0_10px_30px_-18px_rgba(76,29,149,0.35)] dark:bg-white/[0.03] dark:ring-white/[0.07]"
    >
      <button type="button" aria-expanded={open} aria-label={t.details} onClick={() => setOpen((o) => !o)} className="block w-full px-3 pt-3.5 pb-2.5 text-left">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
          <BattleLogSide name={b.challengerName} winner={done && lead === "challenger"} dimmed={done && lead === "opponent"} sick={!!sickId && sickId === b.challengerId} />
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <span className="flex items-baseline gap-1.5 text-2xl leading-none font-semibold tracking-tight tabular-nums">
              <span className={lead === "challenger" ? "text-red-600 dark:text-red-300" : "text-slate-400 dark:text-neutral-500"}>{b.challengerScore || 0}</span>
              <span className="text-base text-slate-300 dark:text-neutral-600">:</span>
              <span className={lead === "opponent" ? "text-red-600 dark:text-red-300" : "text-slate-400 dark:text-neutral-500"}>{b.opponentScore || 0}</span>
            </span>
            <BattleStatusBadge status={b.status} />
          </div>
          <BattleLogSide name={b.opponentName} winner={done && lead === "opponent"} dimmed={done && lead === "challenger"} sick={!!sickId && sickId === b.opponentId} side="right" />
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-400 dark:border-white/[0.05] dark:text-neutral-500">
          <span className={cn("inline-flex items-center gap-1", b.isAutoAssigned && "text-red-500 dark:text-red-300")}>
            <TypeIcon className="h-3 w-3" /> {b.isAutoAssigned ? t.auto : t.manual}
            {done && lead === null && <span className="ml-1.5 text-slate-400">· {t.draw}</span>}
          </span>
          <span className="inline-flex items-center gap-1">
            {t.details}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", open && "rotate-180")} />
          </span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 bg-slate-50/70 px-4 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <BattleLogSales name={b.challengerName} sales={b.challengerSalesDetails} />
              <BattleLogSales name={b.opponentName} sales={b.opponentSalesDetails} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
