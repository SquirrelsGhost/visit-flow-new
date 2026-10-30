import { CalendarCheck, DoorOpen, Swords, UserRound } from "lucide-react";
import type { MeMetrics } from "../../lib/assistant/meTypes";
import type { Vertical } from "../../lib/battle/battleCategories";
import { eur } from "../../lib/tariff/eur";
import type { TeamDaySummary } from "../../lib/team/attendance";
import type { PerformanceDay } from "../../lib/team/teamPerformance";
import { fill } from "../../texts/profileTexts";
import { teamPerformanceTexts as texts } from "../../texts/teamPerformanceTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

interface PerformanceTodayProps {
  today: PerformanceDay | undefined;
  vertical: Vertical;
  /** Eigene Türen von heute, dieselbe Zählung wie die Übersicht (Kartenhäuser). */
  myDoors: number;
  /** Anwesenheit des Teams (nur Leitungen), dieselbe Liste wie im Tagesstatus. */
  attendance: TeamDaySummary | null;
  /** Eigener Monat wie im Profil und im Reiter "Ich". */
  me: MeMetrics | null | undefined;
}

const HREF = { battle: "/battle", overview: "/daily-view", status: "/daily-status", profile: "/profile" } as const;

/** Heute im Zusammenhang: das Team, mein Anteil, wer da ist und mein Monat; jede Zeile führt zur Seite mit den Details. */
export default function PerformanceToday({ today, vertical, myDoors, attendance, me }: PerformanceTodayProps) {
  const teamDoors = today?.visits ?? 0;
  const share = teamDoors > 0 ? Math.min(100, Math.round((myDoors / teamDoors) * 100)) : 0;
  const salesLabel = texts.sales[vertical];
  return (
    <GlassSection label={texts.today}>
      <GlassRow
        icon={Swords}
        tone="red"
        title={texts.todayTeam}
        subtitle={fill(texts.todayTeamValue, { visits: teamDoors, sales: today?.sales ?? 0, salesLabel, umsatz: eur(today?.umsatz ?? 0) })}
        value={texts.goBattle}
        href={HREF.battle}
      />
      <GlassRow
        icon={DoorOpen}
        tone="blue"
        title={texts.myDoors}
        subtitle={myDoors > 0 ? fill(texts.myDoorsValue, { doors: myDoors, share }) : texts.myDoorsNone}
        value={texts.goOverview}
        href={HREF.overview}
      />
      {attendance && attendance.total > 0 && (
        <GlassRow
          icon={CalendarCheck}
          tone={attendance.todo > 0 ? "amber" : "green"}
          title={texts.attendance}
          subtitle={fill(attendance.todo > 0 ? texts.attendanceValue : texts.attendanceDone, { working: attendance.working, total: attendance.total, todo: attendance.todo })}
          value={texts.goStatus}
          href={HREF.status}
        />
      )}
      {me && <GlassRow icon={UserRound} tone="green" title={texts.myMonth} subtitle={fill(texts.myMonthValue, { revenue: eur(me.monthRevenue) })} value={texts.goProfile} href={HREF.profile} />}
    </GlassSection>
  );
}
