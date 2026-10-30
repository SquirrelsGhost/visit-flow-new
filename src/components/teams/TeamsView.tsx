// Rolle und Sparte kommen aus dem Browser
"use client";

import { useAuth } from "../../hooks/useAuth";
import { useVertical } from "../../hooks/useVertical";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { hasAnyRole } from "../../lib/navigation/userMenuItems";
import { DEMO_TEAM_ID } from "../../lib/overview/teamDemoData";
import { orgScopeFor } from "../../lib/teams/orgScope";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import AdminTeams from "./AdminTeams";
import LeaderTeams from "./LeaderTeams";
import OrgNoAccess from "./OrgNoAccess";

/**
 * Meine Teams (/teams): jede Führungskraft sieht ihre Struktur als aufklappbaren Baum mit Zahlen und verwaltet
 * ihre Leute direkt dort. Admin alle Teams, Teamleiter das Team, Strukturleiter die Gruppe, Mentor die Mentees.
 */
export interface TeamsViewProps { readonly _?: never; }

export default function TeamsView() {
  const { user } = useAuth();
  const vertical = useVertical();
  if (!user) return null;
  const scope = orgScopeFor(user.role, (roles) => hasAnyRole(user, roles), user);
  const teamId = typeof user.teamId === "string" ? user.teamId : hasDemoSession() ? DEMO_TEAM_ID : undefined;

  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <GlassBody key={vertical} layout="wide">
          {scope === "all" && <AdminTeams vertical={vertical} meId={user.id} ownTeamId={teamId} />}
          {scope && scope !== "all" && <LeaderTeams vertical={vertical} scope={scope} meId={user.id} />}
          {!scope && <OrgNoAccess />}
        </GlassBody>
      </div>
    </GlassPage>
  );
}
