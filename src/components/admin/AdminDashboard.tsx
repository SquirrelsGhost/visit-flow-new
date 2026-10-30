// Sparte, Demo-Sitzung und Admin-Daten kommen aus dem Browser
"use client";

import { RotateCw } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { useNow } from "../../hooks/useNow";
import { useVertical } from "../../hooks/useVertical";
import { adminFigures } from "../../lib/admin/adminFigures";
import { adminTeamSummary } from "../../lib/admin/adminTeam";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { adminTexts } from "../../texts/adminTexts";
import GlassBody from "../glass/GlassBody";
import GlassFlow from "../glass/GlassFlow";
import GlassFlowItem from "../glass/GlassFlowItem";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import AdminActivityCard from "./AdminActivityCard";
import AdminHero from "./AdminHero";
import AdminLicensesCard from "./AdminLicensesCard";
import AdminRankingCard from "./AdminRankingCard";
import AdminShortcuts from "./AdminShortcuts";
import AdminSkeleton from "./AdminSkeleton";
import AdminStornoCard from "./AdminStornoCard";
import AdminSystemCard from "./AdminSystemCard";
import AdminTasksCard from "./AdminTasksCard";
import AdminTeamCard from "./AdminTeamCard";
import AdminTrendCard from "./AdminTrendCard";
import AdminVerticalsCard from "./AdminVerticalsCard";

const subscribeNever = () => () => {};
const MINUTE = 60_000;

/**
 * Admin-Dashboard (/admin-dashboard, v1 SimpleAdminDashboard): Lage aller Teams auf einen Blick. Ab iPad quer
 * zwei feste Spalten (GlassFlow), links der Verkauf (Verlauf, Storno, Sparten, Rangliste), rechts die Organisation
 * (Aktivität, Team, Lizenzen, Aufgaben, System).
 */
export interface AdminDashboardProps { readonly _?: never; }

export default function AdminDashboard() {
  const vertical = useVertical();
  const now = useNow(MINUTE);
  const demo = useSyncExternalStore(subscribeNever, hasDemoSession, () => false);
  const state = useAdminDashboard();
  const { directory, activity } = state;
  const figures = useMemo(() => (directory && activity ? adminFigures(directory, activity, vertical, now) : null), [directory, activity, vertical, now]);
  const team = useMemo(() => (directory ? adminTeamSummary(directory, now) : null), [directory, now]);

  if (directory === null || activity === null) {
    return (
      <GlassBody>
        <GlassSection>
          <GlassRow icon={RotateCw} tone="red" title={adminTexts.retry} subtitle={adminTexts.failed} onClick={state.reload} />
        </GlassSection>
      </GlassBody>
    );
  }
  if (!figures || !team) return <AdminSkeleton />;
  return (
    <GlassBody key={vertical} layout="wide">
      <AdminHero figures={figures} people={team.people} vertical={vertical} demo={demo} now={now} />
      <GlassFlow>
        <GlassFlowItem><AdminTrendCard days={figures.days} /></GlassFlowItem>
        <GlassFlowItem><AdminStornoCard month={figures.month} /></GlassFlowItem>
        <GlassFlowItem><AdminVerticalsCard byVertical={figures.byVertical} active={vertical} /></GlassFlowItem>
        <GlassFlowItem><AdminRankingCard teams={figures.teams} /></GlassFlowItem>
        <GlassFlowItem col="right"><AdminActivityCard figures={figures} people={team.people} /></GlassFlowItem>
        <GlassFlowItem col="right"><AdminTeamCard team={team} /></GlassFlowItem>
        <GlassFlowItem col="right"><AdminLicensesCard revenue={state.revenue} /></GlassFlowItem>
        <GlassFlowItem col="right"><AdminTasksCard tasks={state.tasks} /></GlassFlowItem>
        <GlassFlowItem col="right"><AdminSystemCard /></GlassFlowItem>
      </GlassFlow>
      <AdminShortcuts />
    </GlassBody>
  );
}
