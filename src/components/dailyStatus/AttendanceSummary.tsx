import { motion, useReducedMotion } from "motion/react";
import { ATTENDANCE_GROUPS, type GroupedMembers, type TeamDaySummary } from "../../lib/team/attendance";
import { GROUP_BAR } from "../../lib/team/attendanceStyles";
import { cn } from "../../lib/cn";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import { fill } from "../../texts/profileTexts";
import GlassNumber from "../glass/GlassNumber";

interface AttendanceSummaryProps {
  summary: TeamDaySummary;
  groups: GroupedMembers;
}

const GROW = { duration: 0.9, ease: [0.16, 1, 0.3, 1] } as const;

/** Kopf der Anwesenheit: wie viele heute arbeiten, und ein Balken, der das Team nach Gruppen aufteilt. */
export default function AttendanceSummary({ summary, groups }: AttendanceSummaryProps) {
  const reduce = useReducedMotion();
  const total = Math.max(1, summary.total);
  return (
    <div className="px-4 pb-4 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-[15px] font-semibold text-foreground">
          <GlassNumber value={summary.working} className="text-[26px] font-semibold tracking-[-0.03em]" />
          <span className="ml-1.5 text-muted-foreground">{fill(texts.summary, { total: summary.total })}</span>
        </p>
        <span className={cn("shrink-0 text-[12px] font-semibold", summary.todo > 0 ? "text-amber-600 dark:text-amber-300" : "text-emerald-600 dark:text-emerald-300")}>
          {summary.todo > 0 ? fill(texts.summaryTodo, { todo: summary.todo }) : texts.summaryDone}
        </span>
      </div>
      <div className="mt-3 flex h-2 gap-[3px] overflow-hidden rounded-full" aria-hidden>
        {ATTENDANCE_GROUPS.filter((g) => groups[g].length > 0).map((g, i) => (
          <motion.span
            key={g}
            className={cn("h-full origin-left rounded-full", GROUP_BAR[g])}
            style={{ width: `${(groups[g].length / total) * 100}%` }}
            initial={{ scaleX: reduce ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={reduce ? { duration: 0 } : { ...GROW, delay: 0.15 + i * 0.06 }}
          />
        ))}
      </div>
    </div>
  );
}
