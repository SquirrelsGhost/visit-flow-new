import { AlertTriangle, CalendarClock, CircleSlash, FileWarning, Lock, type LucideIcon } from "lucide-react";
import { formatDate, formatKm } from "../../lib/logbook/logbookFormat";
import { daysBetween, isoDay } from "../../lib/logbook/logbookDates";
import type { CheckKind, LogbookIssue, Trip } from "../../lib/logbook/logbookTypes";
import type { GlassTone } from "../../lib/glass/glassTones";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassRow from "../glass/GlassRow";
import { SOFT_BUTTON } from "./logbookStyles";

interface LogbookIssueRowProps {
  issue: LogbookIssue;
  trip?: Trip;
  t: LogbookTexts;
  /** Lücke als Privatfahrt nachtragen; fehlt, wenn der Monat abgeschlossen ist. */
  onFillGap?: (issue: LogbookIssue) => void;
  onOpen?: (issue: LogbookIssue) => void;
}

const LOOK: Record<CheckKind, { icon: LucideIcon; tone: GlassTone }> = {
  gap: { icon: AlertTriangle, tone: "red" },
  overlap: { icon: CircleSlash, tone: "red" },
  missing: { icon: FileWarning, tone: "orange" },
  late: { icon: CalendarClock, tone: "amber" },
  unlocked: { icon: Lock, tone: "gray" },
};

function subtitle(issue: LogbookIssue, trip: Trip | undefined, t: LogbookTexts): string {
  const date = formatDate(issue.date, t);
  switch (issue.kind) {
    case "gap":
      return t.gapText(formatKm(issue.km ?? 0, t), String(issue.fromKm), String(issue.toKm), date);
    case "overlap":
      return t.overlapText(formatKm(issue.km ?? 0, t), date);
    case "missing":
      return t.missingText((issue.fields ?? []).map((f) => t.field[f]).join(", "), date);
    case "late":
      return t.lateText(date, trip ? daysBetween(trip.date, isoDay(new Date(trip.createdAt))) : 0);
    default:
      return t.unlockedText;
  }
}

/** Ein Hinweis des Finanzamt-Checks; Lücken lassen sich direkt als Privatfahrt nachtragen. */
export default function LogbookIssueRow({ issue, trip, t, onFillGap, onOpen }: LogbookIssueRowProps) {
  const look = LOOK[issue.kind];
  const fill = issue.kind === "gap" && onFillGap;
  return (
    <div>
      <GlassRow icon={look.icon} tone={look.tone} title={t.issueTitle[issue.kind]} subtitle={subtitle(issue, trip, t)} onClick={onOpen && !fill ? () => onOpen(issue) : undefined} />
      {fill && (
        <div className="-mt-1 pb-3 pl-[4.25rem] pr-4">
          <button type="button" onClick={() => onFillGap(issue)} className={`${SOFT_BUTTON} bg-purple-500/10 text-purple-700 hover:bg-purple-500/15 dark:text-fuchsia-300`}>
            {t.fillGap}
          </button>
        </div>
      )}
    </div>
  );
}
