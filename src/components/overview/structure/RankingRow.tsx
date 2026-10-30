import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { DAILY_STATUS_META } from "../../../lib/overview/dailyStatus";
import { statusOf } from "../../../lib/overview/manageLogic";
import type { RankedMember } from "../../../lib/overview/structureLogic";
import { GLASS_CHEVRON, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../../glass/glassStyles";
import RankBadge from "../contest/RankBadge";

interface RankingRowProps {
  entry: RankedMember;
  rank: number;
  /** Anteil am Besten (0 bis 1) für den feinen Balken. */
  share: number;
  subtitle: string;
  now: Date;
  onOpen: () => void;
}

/** Platz in der Rangliste der Gruppe: Plakette, Name mit Status-Punkt, Abschlüsse und ein leiser Balken. */
export default function RankingRow({ entry, rank, share, subtitle, now, onOpen }: RankingRowProps) {
  const status = DAILY_STATUS_META[statusOf(entry.member, now)];
  return (
    <motion.button layout="position" type="button" onClick={onOpen} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "group")}>
      {entry.sales > 0 ? <RankBadge rank={rank} /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-slate-400 dark:text-white/30">–</span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", status.dot)} />
          <span className={cn(GLASS_TITLE, "truncate")}>{entry.member.name}</span>
        </span>
        <span className={cn(GLASS_SUBTITLE, "truncate")}>{status.isOut ? status.label : subtitle}</span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[var(--glass-track)]">
          <motion.span className="block h-full origin-left rounded-full bg-gradient-to-r from-rose-400 to-red-500" initial={{ scaleX: 0 }} animate={{ scaleX: share }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
        </span>
      </span>
      <span className={cn("shrink-0 text-[19px] font-semibold tabular-nums", entry.sales > 0 ? "text-foreground" : "text-slate-300 dark:text-white/25")}>{entry.sales}</span>
      <ChevronRight aria-hidden className={GLASS_CHEVRON} />
    </motion.button>
  );
}
