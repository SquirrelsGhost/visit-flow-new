// Auf- und Zuklappen, Suche und Filter brauchen State
"use client";

import { ChevronDown, History } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useBattleLogs } from "../../../hooks/useBattleLogs";
import { filterBattles, statusCounts, type LogFilter } from "../../../lib/battle/battleLogs";
import { cn } from "../../../lib/cn";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";
import ArenaSection from "../ArenaSection";
import { GLIDE, PANEL_CARD } from "../battleStyles";
import PanelHeader from "../PanelHeader";
import BattleLogList from "./BattleLogList";
import BattleLogToolbar from "./BattleLogToolbar";
import LogStatusFilter from "./LogStatusFilter";

const EASE = [0.22, 1, 0.36, 1] as const;

/** "Battle Historie & Logs": alle automatischen und manuellen Battles eines Tages, mit Tagesblättern, Suche und Status-Filter. */
export interface BattleLogsProps { readonly _?: never; }

export default function BattleLogs() {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LogFilter>("all");
  const logs = useBattleLogs(open);
  const counts = statusCounts(logs.battles);
  // Ein Filter, den es am gewählten Tag nicht gibt, fällt auf "Alle" zurück
  const active: LogFilter = status === "all" || counts[status] ? status : "all";
  const shown = filterBattles(logs.battles, search, active);
  return (
    <ArenaSection>
      <div className={PANEL_CARD}>
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="block w-full p-5 transition-colors duration-300 hover:bg-slate-50/50 sm:p-6 dark:hover:bg-white/[0.02]">
          <PanelHeader
            icon={History}
            title={t.title}
            subtitle={logs.loading ? t.subtitle : `${t.count(logs.battles.length)} · ${t.subtitle}`}
            trailing={<ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", GLIDE, open && "rotate-180")} />}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
              <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                <BattleLogToolbar search={search} onSearch={setSearch} date={logs.date} onDate={logs.setDate} streaks={logs.streaks} />
                {!logs.loading && <LogStatusFilter value={active} total={logs.battles.length} counts={counts} onChange={setStatus} />}
                <BattleLogList battles={shown} date={logs.date} loading={logs.loading} hasAny={logs.battles.length > 0} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ArenaSection>
  );
}
