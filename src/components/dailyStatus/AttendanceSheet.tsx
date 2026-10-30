// Eingabe für Minuten bzw. Grund lebt im Sheet
"use client";

import { CalendarCog, CheckCircle2, Clock, MessageSquare, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { attendanceGroup, attendanceToday } from "../../lib/team/attendance";
import { effectiveStatus } from "../../lib/team/dailyStatus";
import type { Attendance, TeamMember } from "../../lib/team/teamTypes";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import { fill } from "../../texts/profileTexts";
import GlassRow from "../glass/GlassRow";
import GlassSheet from "../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_CARD, GLASS_DIVIDER, GLASS_FIELD, GLASS_LABEL } from "../glass/glassStyles";
import AttendanceMark from "./AttendanceMark";

interface AttendanceSheetProps {
  member: TeamMember | null;
  onClose: () => void;
  onMark: (member: TeamMember, next: Attendance | null, extra?: string) => void;
  onEditStatus: (member: TeamMember) => void;
}

const MARKS = [
  { id: "present", icon: CheckCircle2, tone: "green" },
  { id: "late", icon: Clock, tone: "orange" },
  { id: "excused", icon: MessageSquare, tone: "purple" },
  { id: "absent", icon: XCircle, tone: "rose" },
] as const;

/** Aktionen zu einer Person (v1: Werkzeugleiste in der Liste), als Bottom-Sheet mit großen Zielen. */
export default function AttendanceSheet({ member, onClose, onMark, onEditStatus }: AttendanceSheetProps) {
  const [prompt, setPrompt] = useState<{ id: string; type: "late" | "excused"; value: string } | null>(null);
  const today = member ? attendanceToday(member) : null;
  const group = member ? attendanceGroup(member) : "open";
  const ask = member && prompt?.id === member.id ? prompt : null;

  const choose = (next: Attendance) => {
    if (!member) return;
    if (next === "late" || next === "excused") return setPrompt({ id: member.id, type: next, value: "" });
    onMark(member, today === next ? null : next);
  };
  const autoReason = member ? member.dailyStatusReason || texts.short[effectiveStatus(member)] : "";

  return (
    <GlassSheet
      open={member !== null}
      onClose={onClose}
      title={member?.name ?? ""}
      subtitle={member ? fill(texts.sheetSubtitle, { status: texts.short[effectiveStatus(member)], group: texts.groups[group] }) : undefined}
    >
      {member && group === "pending" && (
        <div className={GLASS_CARD}>
          <GlassRow icon={ShieldCheck} tone="amber" title={texts.confirm} subtitle={texts.confirmText} onClick={() => onMark(member, "excused", autoReason)} />
        </div>
      )}
      <section>
        <h3 className={GLASS_LABEL}>{texts.attendanceActions}</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {MARKS.map((mark) => (
            <AttendanceMark key={mark.id} icon={mark.icon} tone={mark.tone} label={texts.marks[mark.id]} active={today === mark.id} onClick={() => choose(mark.id)} />
          ))}
        </div>
      </section>
      {member && ask && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onMark(member, ask.type, ask.value);
            setPrompt(null);
          }}
        >
          <input
            autoFocus
            type={ask.type === "late" ? "number" : "text"}
            inputMode={ask.type === "late" ? "numeric" : undefined}
            min={0}
            value={ask.value}
            onChange={(e) => setPrompt({ ...ask, value: e.target.value })}
            placeholder={ask.type === "late" ? texts.minutesPlaceholder : texts.excusePlaceholder}
            aria-label={ask.type === "late" ? texts.minutesPlaceholder : texts.excusePlaceholder}
            className={GLASS_FIELD}
          />
          <button type="submit" className={`${GLASS_BUTTON} !w-auto shrink-0 px-5`}>
            {texts.apply}
          </button>
        </form>
      )}
      <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
        {member && <GlassRow icon={CalendarCog} tone="indigo" title={texts.editStatus} subtitle={texts.editStatusText} onClick={() => onEditStatus(member)} />}
        {member && today && <GlassRow icon={XCircle} tone="gray" title={texts.clear} onClick={() => onMark(member, null)} chevron={false} />}
      </div>
    </GlassSheet>
  );
}
