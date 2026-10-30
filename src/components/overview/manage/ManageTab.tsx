// Sheets, Filter und Teamdaten leben im Browser
"use client";

import { useMemo, useRef, useState } from "react";
import { useLastDefined } from "../../../hooks/useLastDefined";
import { useManageTeam } from "../../../hooks/useManageTeam";
import { hasDemoSession } from "../../../lib/auth/demoSession";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { draftFromContest, type ContestDraft } from "../../../lib/overview/contestForm";
import type { Contest } from "../../../lib/overview/contestTypes";
import { statsOf, teamPulse, type ManageFilter } from "../../../lib/overview/manageLogic";
import { goalLines, monthShare, readTeamGoals } from "../../../lib/overview/teamGoals";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import GlassBody from "../../glass/GlassBody";
import GlassSplit from "../../glass/GlassSplit";
import MyTeamsLink from "../../teams/MyTeamsLink";
import TeamLensChips, { type TeamLens } from "../team/TeamLensChips";
import ContestAdminSection from "./ContestAdminSection";
import ContestFormSheet from "./ContestFormSheet";
import GoalsCard from "./GoalsCard";
import GoalsSheet from "./GoalsSheet";
import ManageActions from "./ManageActions";
import ManageAlerts from "./ManageAlerts";
import ManageHero from "./ManageHero";
import MemberSection from "./MemberSection";
import MemberSheet from "./MemberSheet";

interface ManageTabProps {
  vertical: Vertical;
  /** Alle Gewinnspiele (auch beendete), für die Verwaltung. */
  contests: readonly Contest[];
  /** Nur im Admin-Reiter "Team": Plaketten zum Wechsel in eine Strukturleiter-Gruppe. */
  teamLens?: TeamLens;
}

interface ContestForm {
  key: number;
  draft: ContestDraft | null;
}

/** Reiter "Verwaltung" für Teamleiter und Admins (v1 TeamleiterVerwaltung), als eine ruhige Glas-Seite. */
export default function ManageTab({ vertical, contests, teamLens }: ManageTabProps) {
  const team = useManageTeam(vertical);
  const solar = vertical === "solar";
  const teamId = team.teamId ?? "";
  const [filter, setFilter] = useState<ManageFilter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const shownMember = useLastDefined(editing);
  const [goals, setGoals] = useState(() => readTeamGoals(teamId, vertical));
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [goalsKey, setGoalsKey] = useState(0);
  const [form, setForm] = useState<ContestForm | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const pulse = useMemo(() => teamPulse(team.users, team.stats, team.now), [team.users, team.stats, team.now]);
  const lines = useMemo(() => goalLines(goals, team.products, vertical, team.now), [goals, team.products, vertical, team.now]);

  const toList = (next: ManageFilter, focus = false) => {
    setFilter(next);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus) window.setTimeout(() => listRef.current?.querySelector("input")?.focus({ preventScroll: true }), 350);
  };
  const openGoals = () => {
    setGoalsKey((k) => k + 1);
    setGoalsOpen(true);
  };
  const openForm = (draft: ContestDraft | null) => {
    setForm((f) => ({ key: (f?.key ?? 0) + 1, draft }));
    setFormOpen(true);
  };

  return (
    <GlassBody layout="wide">
      <GlassSplit
        aside={
          <>
            {teamLens && <TeamLensChips users={team.users} {...teamLens} />}
            <ManageHero pulse={pulse} vertical={vertical} demo={hasDemoSession()} now={team.now} />
            <ManageActions onGoals={openGoals} onContest={() => openForm(null)} onAbsent={() => toList("out")} onSearch={() => toList("all", true)} />
            <ManageAlerts pulse={pulse} onAbsent={() => toList("out")} />
            <GoalsCard lines={lines} plan={monthShare(team.now)} onEdit={openGoals} />
            <ContestAdminSection contests={contests} teamId={teamId} now={team.now} onCreate={() => openForm(null)} onEdit={(c) => openForm(draftFromContest(c, vertical))} />
            <MyTeamsLink />
          </>
        }
      >
        <MemberSection ref={listRef} users={team.users} stats={team.stats} solar={solar} now={team.now} filter={filter} query={query} onFilter={setFilter} onQuery={setQuery} onOpen={setEditing} />
      </GlassSplit>

      {shownMember && (
        <MemberSheet key={shownMember.id} member={shownMember} open={editing !== null} users={team.users} stats={statsOf(team.stats, shownMember.id)} solar={solar} now={team.now} onClose={() => setEditing(null)} />
      )}
      <GoalsSheet key={goalsKey} open={goalsOpen} teamId={teamId} vertical={vertical} goals={goals} onSaved={setGoals} onClose={() => setGoalsOpen(false)} />
      {form && (
        <ContestFormSheet key={form.key} open={formOpen} initial={form.draft} vertical={vertical} teamId={teamId} userId={team.userId ?? ""} users={team.users} solar={solar} onClose={() => setFormOpen(false)} />
      )}
    </GlassBody>
  );
}
