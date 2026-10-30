import { ChevronRight } from "lucide-react";
import { attendanceGroup, type AttendanceGroup } from "../../lib/team/attendance";
import { GROUP_CHIP, GROUP_TONE } from "../../lib/team/attendanceStyles";
import { cn } from "../../lib/cn";
import { GLASS_TONES } from "../../lib/glass/glassTones";
import { effectiveStatus, statusWindow } from "../../lib/team/dailyStatus";
import { formatShortDay } from "../../lib/team/statusDraft";
import type { TeamMember } from "../../lib/team/teamTypes";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import { fill } from "../../texts/profileTexts";
import { GLASS_CHEVRON, GLASS_ICON, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../glass/glassStyles";

interface AttendanceRowProps {
  member: TeamMember;
  onOpen: (member: TeamMember) => void;
}

/** Unterzeile wie die Plaketten in v1: Minuten, Entschuldigungsgrund oder gemeldete Abwesenheit mit Zeitraum. */
function detail(member: TeamMember, group: AttendanceGroup): string {
  if (group === "late" && member.dailyAttendanceMinutesLate) return fill(texts.minutesLate, { minutes: member.dailyAttendanceMinutesLate });
  if (group === "excused" && member.dailyAttendanceReason) return member.dailyAttendanceReason;
  const status = effectiveStatus(member);
  if (status === "active") return texts.short.active;
  const window = statusWindow(member);
  const range = window ? (window.start === window.end ? formatShortDay(window.start) : `${formatShortDay(window.start)} – ${formatShortDay(window.end)}`) : "";
  return [texts.short[status], range, member.dailyStatusReason && `„${member.dailyStatusReason}“`].filter(Boolean).join(" · ");
}

/** Eine Person der Anwesenheitsliste: Initiale in der Gruppenfarbe, Name, Detail, Gruppen-Plakette. */
export default function AttendanceRow({ member, onOpen }: AttendanceRowProps) {
  const group = attendanceGroup(member);
  return (
    <button type="button" onClick={() => onOpen(member)} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "group")}>
      <span aria-hidden className={cn(GLASS_ICON, GLASS_TONES[GROUP_TONE[group]].icon, "text-[14px] font-semibold")}>
        {member.name.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn(GLASS_TITLE, "truncate")}>{member.name}</span>
        <span className={cn(GLASS_SUBTITLE, "truncate")}>{detail(member, group)}</span>
      </span>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset", GROUP_CHIP[group])}>{texts.chips[group]}</span>
      <ChevronRight aria-hidden className={GLASS_CHEVRON} />
    </button>
  );
}
