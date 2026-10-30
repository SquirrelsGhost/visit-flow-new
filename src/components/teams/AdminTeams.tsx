// Verzeichnis, Zahlen je Team und Sheets leben im Browser
"use client";

import { CalendarCheck, ChevronsDownUp, ChevronsUpDown, CreditCard, RefreshCw, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useOrgActivity } from "../../hooks/useOrgActivity";
import { useOrgDirectory } from "../../hooks/useOrgDirectory";
import { useOrgOpen } from "../../hooks/useOrgOpen";
import { useTeamLicenses } from "../../hooks/useTeamLicenses";
import { hasDemoSession } from "../../lib/auth/demoSession";
import type { Vertical } from "../../lib/battle/battleCategories";
import { adminHero } from "../../lib/teams/orgHeroStats";
import { branchIds, defaultOpen, teamForest } from "../../lib/teams/orgTree";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassQuickAction from "../glass/GlassQuickAction";
import GlassSplit from "../glass/GlassSplit";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import InviteSheet from "./InviteSheet";
import OrgActions from "./OrgActions";
import OrgExplorer from "./OrgExplorer";
import OrgHero from "./OrgHero";
import OrgPeopleSheets from "./OrgPeopleSheets";

interface AdminTeamsProps {
  vertical: Vertical;
  meId: string;
  /** Eigenes Team des Admins: dort gelten die Team-Lizenzen. */
  ownTeamId?: string;
}

const actions = teamsTexts.actions;

/** Meine Teams für Admins: alle Teams als Äste, Zahlen laden beim Aufklappen, dazu Team wechseln und sperren. */
export default function AdminTeams({ vertical, meId, ownTeamId }: AdminTeamsProps) {
  const router = useRouter();
  const { directory, reload } = useOrgDirectory();
  const licenses = useTeamLicenses(Boolean(ownTeamId));
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const users = useMemo(() => directory?.users ?? [], [directory]);
  const teams = useMemo(() => directory?.teams ?? [], [directory]);

  const nodes = useMemo(() => teamForest(teams, users, teamsTexts.tree.noTeam), [teams, users]);
  const defaults = useMemo(() => defaultOpen(nodes, ownTeamId), [nodes, ownTeamId]);
  const branches = useMemo(() => branchIds(nodes), [nodes]);
  const { open, toggle, toggleAll, allOpen } = useOrgOpen(defaults, branches);
  const expanded = nodes.filter((n) => open.has(n.id) && n.kind === "team").map((n) => (n.kind === "team" ? n.team.id : ""));
  const activity = useOrgActivity(expanded, vertical);
  const hero = adminHero(users, teams.length, activity.now);

  if (directory === null) {
    return (
      <GlassSection>
        <GlassRow icon={RefreshCw} tone="red" title={teamsTexts.failed} subtitle={teamsTexts.retry} onClick={reload} />
      </GlassSection>
    );
  }

  return (
    <>
      <GlassSplit
        sticky
        aside={
          <>
            <OrgHero eyebrow={teamsTexts.eyebrow.all} {...hero} vertical={vertical} demo={hasDemoSession()} now={activity.now} />
            <OrgActions>
              <GlassQuickAction icon={UserPlus} label={actions.invite} onClick={() => setInviting(true)} disabled={!licenses.data} />
              <GlassQuickAction icon={CreditCard} label={actions.licenses} onClick={() => router.push("/subscription?licensing=true")} />
              <GlassQuickAction icon={CalendarCheck} label={actions.status} onClick={() => router.push("/daily-status")} />
              <GlassQuickAction icon={allOpen ? ChevronsDownUp : ChevronsUpDown} label={allOpen ? actions.collapse : actions.expand} onClick={toggleAll} disabled={branches.length === 0} />
            </OrgActions>
          </>
        }
      >
        <OrgExplorer
          nodes={nodes}
          scope="all"
          users={users}
          stats={activity.stats}
          open={open}
          loadedTeams={activity.loadedTeams}
          meId={meId}
          solar={vertical === "solar"}
          now={activity.now}
          onToggle={toggle}
          loading={directory === undefined}
          onOpen={(user) => () => setEditing(user.id)}
        />
      </GlassSplit>
      <OrgPeopleSheets
        editing={editing}
        users={users}
        stats={activity.stats}
        solar={vertical === "solar"}
        now={activity.now}
        leadId={meId}
        licenses={licenses}
        licenseTeamId={ownTeamId}
        teams={teams}
        onClose={() => setEditing(null)}
      />
      {licenses.data && <InviteSheet open={inviting} licenses={licenses} onClose={() => setInviting(false)} />}
    </>
  );
}
