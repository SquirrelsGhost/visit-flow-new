// Zeitraum, Sparte, Demo-Sitzung und lokale Kartenhäuser kommen aus dem Browser
"use client";

import { RotateCw } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useMeMetrics } from "../../hooks/useMeMetrics";
import { useTeamMembers } from "../../hooks/useTeamMembers";
import { useTeamPerformance } from "../../hooks/useTeamPerformance";
import { useTodayStats } from "../../hooks/useTodayStats";
import { useVertical } from "../../hooks/useVertical";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { cn } from "../../lib/cn";
import { teamDaySummary, visibleMembers } from "../../lib/team/attendance";
import { canTrackAttendance } from "../../lib/team/statusDraft";
import { PERIODS, splitPeriods, totalsOf, type Period } from "../../lib/team/teamPerformance";
import { teamPerformanceTexts as texts } from "../../texts/teamPerformanceTexts";
import GlassBody from "../glass/GlassBody";
import GlassFilterChips from "../glass/GlassFilterChips";
import GlassPage from "../glass/GlassPage";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import PerformanceChartCard from "./PerformanceChartCard";
import PerformanceGlance from "./PerformanceGlance";
import PerformanceHero from "./PerformanceHero";
import PerformanceLinks from "./PerformanceLinks";
import PerformanceSkeleton from "./PerformanceSkeleton";
import PerformanceToday from "./PerformanceToday";

const subscribeNever = () => () => {};
const PERIOD_OPTIONS = PERIODS.map((p) => ({ id: String(p) as `${Period}`, label: texts.periods[p] }));

/**
 * Teamleistung (/team-performance, v1 TeamPerformanceDialog): Umsatz, Türen und Sales des Teams im Zeitraum mit
 * Vergleich zu davor, Verlauf und dem heutigen Tag im Zusammenhang mit Übersicht, Tagesstatus, Battle und Profil.
 */
export interface TeamPerformanceViewProps { readonly _?: never; }

export default function TeamPerformanceView() {
  const { user } = useAuth();
  const vertical = useVertical();
  const demo = useSyncExternalStore(subscribeNever, hasDemoSession, () => false);
  const [period, setPeriod] = useState<Period>(30);
  const teamId = typeof user?.teamId === "string" && user.teamId ? user.teamId : undefined;
  const perf = useTeamPerformance(teamId, period, vertical);
  const { stats } = useTodayStats(vertical);
  const me = useMeMetrics();
  const leader = canTrackAttendance(user?.role ?? "berater", user?.teamId);
  const team = useTeamMembers(Boolean(user) && leader);
  const attendance = useMemo(() => (leader && user && team.members ? teamDaySummary(visibleMembers(user, team.members)) : null), [leader, user, team.members]);

  const split = perf.days ? splitPeriods(perf.days, perf.period) : null;
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <GlassBody layout="wide">
          <GlassFilterChips options={PERIOD_OPTIONS} active={String(period) as `${Period}`} onChange={(id) => setPeriod(Number(id) as Period)} label={texts.periodLabel} layoutId="perf-period" />
          {perf.days === undefined && <PerformanceSkeleton />}
          {perf.days === null && (
            <GlassSection>
              <GlassRow icon={RotateCw} tone="red" title={texts.retry} subtitle={texts.failed} onClick={perf.reload} />
            </GlassSection>
          )}
          {split && (
            <div className={cn("space-y-7 transition-opacity duration-300 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-7 lg:space-y-0", perf.loading && "opacity-60")}>
              <PerformanceHero current={totalsOf(split.current)} previous={totalsOf(split.previous)} period={perf.period} vertical={vertical} mentees={!teamId && !demo} demo={demo} />
              <PerformanceChartCard days={perf.days ?? []} period={perf.period} vertical={vertical} />
              <PerformanceToday today={split.current[split.current.length - 1]} vertical={vertical} myDoors={stats.doors} attendance={attendance} me={me} />
              <PerformanceGlance days={split.current} period={perf.period} vertical={vertical} />
            </div>
          )}
          <PerformanceLinks demo={demo} />
        </GlassBody>
      </div>
    </GlassPage>
  );
}
