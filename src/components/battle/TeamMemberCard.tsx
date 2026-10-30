// Rückt beim Umsortieren mit layout-Animation weich an den neuen Platz
"use client";

import { Flame, Loader2, SlidersHorizontal, Swords } from "lucide-react";
import { motion } from "motion/react";
import type { Streak, TeamMember } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import { AVATAR, PILL_BUTTON, initial } from "./battleStyles";
import MemberStreak from "./MemberStreak";

interface TeamMemberCardProps {
  member: TeamMember;
  streak: Streak | undefined;
  active: boolean;
  loading: boolean;
  canManage: boolean;
  onChallenge: () => void;
  onManageSales: () => void;
}

const CATEGORY = {
  newcomer: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  experienced: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
} as const;

/** Teammitglied als Glas-Zeile: Bild (mit Flamme bei Serie), Sales heute, Monat, Serie und der Battle-Knopf. */
export default function TeamMemberCard(props: TeamMemberCardProps) {
  const { member: m, streak, active, loading, canManage, onChallenge, onManageSales } = props;
  const hot = (streak?.streak ?? 0) >= 2;
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className={cn("flex items-center gap-3.5 px-4 py-3", active && "opacity-60")}
    >
      <span className="relative">
        <span className={cn(AVATAR, "h-9 w-9 text-[14px]")}>{initial(m.name)}</span>
        {hot && (
          <span className="absolute -right-1.5 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 ring-2 ring-[var(--glass-fill-strong)]">
            <Flame aria-hidden className="arena-flame h-3 w-3 fill-white/90 text-white" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-foreground">{m.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <span className="shrink-0">{t.salesToday(m.totalSales)}</span>
          {m.category && (
            <span className={cn("shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-semibold", CATEGORY[m.category])} title={m.category === "newcomer" ? t.newcomer : t.experienced}>
              {m.month ? t.monthShort(m.month) : m.category === "newcomer" ? t.newcomer : t.experienced}
            </span>
          )}
          <MemberStreak streak={streak} compact />
        </span>
      </span>
      {canManage && (
        <button type="button" onClick={onManageSales} title={t.manageSales} aria-label={`${t.manageSales}: ${m.name}`} className="-mx-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-[var(--glass-hover)] hover:text-foreground dark:text-white/40">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      )}
      {active ? (
        <span className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-[var(--glass-track)] px-3 text-[12px] font-semibold text-slate-500 dark:text-white/55">
          <Swords aria-hidden className="h-3.5 w-3.5" />
          {t.inBattle}
        </span>
      ) : (
        <button type="button" onClick={onChallenge} disabled={loading} aria-label={`${t.challenge}: ${m.name}`} className={cn(PILL_BUTTON, "px-3.5", hot && "arena-btn-pulse")}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
          {t.challenge}
        </button>
      )}
    </motion.div>
  );
}
