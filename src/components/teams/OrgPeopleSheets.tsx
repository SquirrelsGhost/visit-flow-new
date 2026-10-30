import { useState } from "react";
import { toast } from "sonner";
import { useLastDefined } from "../../hooks/useLastDefined";
import type { TeamLicenseState } from "../../hooks/useTeamLicenses";
import { statsOf, type MemberStats } from "../../lib/overview/manageLogic";
import { updateMember, type MemberPatch } from "../../lib/overview/memberApi";
import type { StructureLens } from "../../lib/overview/structureLogic";
import type { TeamUser } from "../../lib/overview/teamTypes";
import type { OrgTeam } from "../../lib/teams/orgTypes";
import { manageTexts } from "../../texts/manageTexts";
import { fill } from "../../texts/profileTexts";
import { structureTexts } from "../../texts/structureTexts";
import ConfirmDialog from "../profile/ConfirmDialog";
import OrgMemberSheet from "./OrgMemberSheet";

interface OrgPeopleSheetsProps {
  /** Id der Person, deren Fenster offen ist. */
  editing: string | null;
  users: readonly TeamUser[];
  stats: Map<string, MemberStats>;
  solar: boolean;
  now: Date;
  /** Strukturleiter oder Mentor schauen auf ihre Leute (weniger Rechte). */
  lens?: StructureLens;
  leadId: string;
  licenses?: TeamLicenseState;
  /** Lizenzen gelten nur fürs eigene Team (v1 /teams/my-team/licenses). */
  licenseTeamId?: string;
  teams?: readonly OrgTeam[];
  onClose: () => void;
}

/** Bearbeiten-Fenster und Rückfrage beim Entfernen; zeigt immer den frischen Stand der Person. */
export default function OrgPeopleSheets({ editing, users, stats, solar, now, lens, leadId, licenses, licenseTeamId, teams, onClose }: OrgPeopleSheetsProps) {
  const current = editing ? (users.find((u) => u.id === editing) ?? null) : null;
  const shown = useLastDefined(current);
  const [removing, setRemoving] = useState<TeamUser | null>(null);
  if (!shown) return null;

  // Gruppe und Mentor wählt man nur aus dem eigenen Team der Person
  const teamUsers = shown.teamId ? users.filter((u) => u.teamId === shown.teamId) : users;
  const withLicense = licenses && (!licenseTeamId || shown.teamId === licenseTeamId) ? licenses : undefined;

  const remove = async (member: TeamUser) => {
    if (!lens) return;
    const patch: MemberPatch = lens === "structure" ? { strukturleiterId: null, ...(member.mentorId === leadId ? { mentorId: null } : {}) } : { mentorId: null };
    const ok = await updateMember(member.id, patch).catch(() => false);
    if (!ok) return void toast.error(manageTexts.member.failed);
    toast.success(fill(structureTexts.removed, { name: member.name.split(" ")[0] ?? member.name }));
    setRemoving(null);
    onClose();
  };

  return (
    <>
      <OrgMemberSheet
        member={shown}
        open={current !== null}
        users={teamUsers}
        stats={statsOf(stats, shown.id)}
        solar={solar}
        now={now}
        onClose={onClose}
        lead={lens ? { lens, onRemove: () => setRemoving(shown) } : undefined}
        licenses={withLicense}
        teams={teams}
      />
      {lens && (
        <ConfirmDialog open={removing !== null} title={structureTexts.remove[lens]} confirmLabel={structureTexts.remove[lens]} cancelLabel={structureTexts.cancel} busy={false} onConfirm={() => removing && void remove(removing)} onClose={() => setRemoving(null)}>
          {fill(structureTexts.removeBody[lens], { name: removing?.name ?? "" })}
        </ConfirmDialog>
      )}
    </>
  );
}
