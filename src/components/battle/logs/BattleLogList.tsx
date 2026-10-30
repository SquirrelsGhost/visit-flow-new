// Einträge erscheinen gestaffelt und gleiten beim Filtern
"use client";

import { SearchX, Swords } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { AdminBattle } from "../../../lib/battle/battleTypes";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";
import BattleLogRow from "./BattleLogRow";
import BattleLogSkeleton from "./BattleLogSkeleton";

interface BattleLogListProps {
  battles: AdminBattle[];
  date: string;
  loading: boolean;
  /** Gibt es an dem Tag überhaupt Battles (vor Suche und Filter)? */
  hasAny: boolean;
}

/** Liste der Paarungen eines Tages mit Lade-Skelett und ruhigem Leerzustand. */
export default function BattleLogList({ battles, date, loading, hasAny }: BattleLogListProps) {
  if (loading) return <BattleLogSkeleton />;
  if (battles.length === 0) {
    const Icon = hasAny ? SearchX : Swords;
    return (
      <motion.div key={`empty-${date}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center px-6 py-10 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/15 ring-inset dark:text-red-300">
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{hasAny ? t.noMatch : t.empty}</p>
        {!hasAny && <p className="mt-1 text-[12px] text-slate-400 dark:text-neutral-500">{t.emptyHint}</p>}
      </motion.div>
    );
  }
  return (
    <ul className="space-y-2.5">
      <AnimatePresence initial={false} mode="popLayout">
        {battles.map((b, i) => (
          <BattleLogRow key={`${date}-${b._id}`} battle={b} index={i} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
