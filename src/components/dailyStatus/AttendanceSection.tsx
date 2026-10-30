// Filter, geöffnetes Sheet und Zwischenablage brauchen den Browser
"use client";

import { Copy, RotateCw } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ATTENDANCE_GROUPS, groupMembers, teamDaySummary, whatsappText, type AttendanceGroup } from "../../lib/team/attendance";
import { riseIn } from "../../lib/motion/presets";
import type { Attendance, TeamMember } from "../../lib/team/teamTypes";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import GlassFilterChips from "../glass/GlassFilterChips";
import GlassRow from "../glass/GlassRow";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_FOOTER, GLASS_LABEL } from "../glass/glassStyles";
import AttendanceRow from "./AttendanceRow";
import AttendanceSheet from "./AttendanceSheet";
import AttendanceSummary from "./AttendanceSummary";

interface AttendanceSectionProps {
  /** Sichtbare Teammitglieder; undefined = lädt, null = Fehler. */
  members: TeamMember[] | null | undefined;
  onMark: (member: TeamMember, next: Attendance | null, extra?: string) => void;
  onEditStatus: (member: TeamMember) => void;
  onRetry: () => void;
}

type Filter = AttendanceGroup | "all";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(texts.copied);
  } catch {
    toast.error(texts.copyFailed);
  }
}

/** Anwesenheit heute (v1 TeamActivityList): Bilanz, Filter nach Gruppe, Personen; Tippen öffnet die Aktionen. */
export default function AttendanceSection({ members, onMark, onEditStatus, onRetry }: AttendanceSectionProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const groups = useMemo(() => groupMembers(members ?? []), [members]);
  const summary = useMemo(() => teamDaySummary(members ?? []), [members]);
  const open = members?.find((m) => m.id === openId) ?? null;
  const options = [
    { id: "all" as const, label: texts.all, count: members?.length ?? 0 },
    ...ATTENDANCE_GROUPS.filter((g) => groups[g].length > 0).map((g) => ({ id: g, label: texts.groups[g], count: groups[g].length })),
  ];
  // Leert sich die gewählte Gruppe (alle abgehakt), springt der Filter zurück auf "Alle"
  const active: Filter = options.some((o) => o.id === filter) ? filter : "all";
  const shown = active === "all" ? ATTENDANCE_GROUPS.flatMap((g) => groups[g]) : groups[active];

  const mark = (member: TeamMember, next: Attendance | null, extra?: string) => {
    setOpenId(null);
    onMark(member, next, extra);
  };

  return (
    <motion.section variants={riseIn} aria-labelledby="daily-status-attendance">
      <h3 id="daily-status-attendance" className={GLASS_LABEL}>
        {texts.attendance}
      </h3>
      {members === undefined && <div className={`${GLASS_CARD} h-48 animate-pulse`} />}
      {members === null && (
        <div className={GLASS_CARD}>
          <GlassRow icon={RotateCw} tone="red" title={texts.retry} subtitle={texts.attendanceFailed} onClick={onRetry} />
        </div>
      )}
      {members && members.length === 0 && <div className={`${GLASS_CARD} px-4 py-6 text-center text-[14px] text-muted-foreground`}>{texts.attendanceEmpty}</div>}
      {members && members.length > 0 && (
        <>
          <div className={GLASS_CARD}>
            <AttendanceSummary summary={summary} groups={groups} />
          </div>
          <div className="mt-3">
            <GlassFilterChips options={options} active={active} onChange={setFilter} label={texts.filterLabel} layoutId="attendance-filter" />
          </div>
          <div className={`${GLASS_CARD} ${GLASS_DIVIDER} mt-3`}>
            {shown.map((member) => (
              <AttendanceRow key={member.id} member={member} onOpen={(m) => setOpenId(m.id)} />
            ))}
            <GlassRow icon={Copy} tone="green" title={texts.copy} onClick={() => void copy(whatsappText(groups))} chevron={false} />
          </div>
          <p className={GLASS_FOOTER}>{texts.attendanceFooter}</p>
        </>
      )}
      <AttendanceSheet
        member={open}
        onClose={() => setOpenId(null)}
        onMark={mark}
        onEditStatus={(m) => {
          setOpenId(null);
          onEditStatus(m);
        }}
      />
    </motion.section>
  );
}
