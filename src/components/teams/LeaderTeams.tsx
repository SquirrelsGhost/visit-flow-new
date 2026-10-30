// Teamdaten, offene Äste und Sheets leben im Browser
"use client";

import { Activity, CalendarCheck, ChevronsDownUp, ChevronsUpDown, CreditCard, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useManageTeam } from "../../hooks/useManageTeam";
import { useOrgOpen } from "../../hooks/useOrgOpen";
import { useTeamLicenses } from "../../hooks/useTeamLicenses";
import { hasDemoSession } from "../../lib/auth/demoSession";
import type { Vertical } from "../../lib/battle/battleCategories";
import { teamPulse } from "../../lib/overview/manageLogic";
import { leaderHero } from "../../lib/teams/orgHeroStats";
import { branchIds, defaultOpen, personForest, scopeUsers } from "../../lib/teams/orgTree";
import type { OrgScope } from "../../lib/teams/orgTypes";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassQuickAction from "../glass/GlassQuickAction";
import GlassSplit from "../glass/GlassSplit";
import AddToGroupSheet from "./AddToGroupSheet";
import InviteSheet from "./InviteSheet";
import OrgActions from "./OrgActions";
import OrgExplorer from "./OrgExplorer";
import OrgHero from "./OrgHero";
import OrgPeopleSheets from "./OrgPeopleSheets";

interface LeaderTeamsProps {
  vertical: Vertical;
  scope: Exclude<OrgScope, "all">;
  meId: string;
}

const actions = teamsTexts.actions;

/** Meine Teams für Teamleiter (ganzes Team), Strukturleiter (eigene Gruppe) und Mentoren (Mentees). */
export default function LeaderTeams({ vertical, scope, meId }: LeaderTeamsProps) {
  const router = useRouter();
  const team = useManageTeam(vertical);
  const licenses = useTeamLicenses(scope === "team");
  const [sheet, setSheet] = useState<"invite" | "add" | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const scoped = useMemo(() => scopeUsers(scope, meId, team.users, team.now), [scope, meId, team.users, team.now]);
  const nodes = useMemo(() => personForest(scoped, team.now), [scoped, team.now]);
  const defaults = useMemo(() => defaultOpen(nodes), [nodes]);
  const branches = useMemo(() => branchIds(nodes), [nodes]);
  const { open, toggle, toggleAll, allOpen } = useOrgOpen(defaults, branches);
  const people = scope === "team" ? team.users : scoped.filter((u) => u.id !== meId);
  const hero = leaderHero(teamPulse(people, team.stats, team.now));
  const lens = scope === "group" ? "structure" : scope === "mentees" ? "mentor" : undefined;

  return (
    <>
      <GlassSplit
        sticky
        aside={
          <>
            <OrgHero eyebrow={teamsTexts.eyebrow[scope]} {...hero} vertical={vertical} demo={hasDemoSession()} now={team.now} />
            <OrgActions>
              {scope === "team" && <GlassQuickAction icon={UserPlus} label={actions.invite} onClick={() => setSheet("invite")} disabled={!licenses.data} />}
              {scope === "group" && <GlassQuickAction icon={UserPlus} label={actions.add} onClick={() => setSheet("add")} />}
              {scope === "team" ? (
                <GlassQuickAction icon={CreditCard} label={actions.licenses} onClick={() => router.push("/subscription?licensing=true")} />
              ) : (
                <GlassQuickAction icon={Activity} label={actions.performance} onClick={() => router.push("/team-performance")} />
              )}
              <GlassQuickAction icon={CalendarCheck} label={actions.status} onClick={() => router.push("/daily-status")} />
              <GlassQuickAction icon={allOpen ? ChevronsDownUp : ChevronsUpDown} label={allOpen ? actions.collapse : actions.expand} onClick={toggleAll} disabled={branches.length === 0} />
            </OrgActions>
          </>
        }
      >
        <OrgExplorer
          nodes={nodes}
          scope={scope}
          users={team.users}
          stats={team.stats}
          open={open}
          meId={meId}
          solar={vertical === "solar"}
          now={team.now}
          onToggle={toggle}
          loading={team.loading}
          onOpen={(user) => (scope === "team" || user.id !== meId ? () => setEditing(user.id) : undefined)}
        />
      </GlassSplit>
      <OrgPeopleSheets
        editing={editing}
        users={team.users}
        stats={team.stats}
        solar={vertical === "solar"}
        now={team.now}
        lens={lens}
        leadId={meId}
        licenses={scope === "team" ? licenses : undefined}
        onClose={() => setEditing(null)}
      />
      {licenses.data && <InviteSheet open={sheet === "invite"} licenses={licenses} onClose={() => setSheet(null)} />}
      {scope === "group" && <AddToGroupSheet open={sheet === "add"} meId={meId} users={team.users} now={team.now} onClose={() => setSheet(null)} />}
    </>
  );
}
