import type { TeamLicenseState } from "../../hooks/useTeamLicenses";
import type { MemberStats } from "../../lib/overview/manageLogic";
import type { StructureLens } from "../../lib/overview/structureLogic";
import type { TeamUser } from "../../lib/overview/teamTypes";
import type { OrgTeam } from "../../lib/teams/orgTypes";
import MemberSheet from "../overview/manage/MemberSheet";
import OrgAdminFields from "./OrgAdminFields";
import OrgLicenseFields from "./OrgLicenseFields";

interface OrgMemberSheetProps {
  member: TeamUser;
  open: boolean;
  /** Personen des Teams der Person, für Gruppe und Mentor. */
  users: readonly TeamUser[];
  stats: MemberStats;
  solar: boolean;
  now: Date;
  onClose: () => void;
  /** Strukturleiter und Mentoren: weniger Rechte, dafür "aus Gruppe entfernen". */
  lead?: { lens: StructureLens; onRemove: () => void };
  /** Teamleiter und Admin im eigenen Team: Lizenz der Person. */
  licenses?: TeamLicenseState;
  /** Nur Admin: Team wechseln, sperren. */
  teams?: readonly OrgTeam[];
}

/** Bearbeiten einer Person aus dem Baum: das Fenster der Verwaltung, ergänzt um Lizenz und Admin-Rechte. */
export default function OrgMemberSheet({ member, open, users, stats, solar, now, onClose, lead, licenses, teams }: OrgMemberSheetProps) {
  const extra = (
    <>
      {licenses && <OrgLicenseFields email={member.email} licenses={licenses} />}
      {teams && <OrgAdminFields key={member.id} member={member} teams={teams} />}
    </>
  );
  return <MemberSheet key={member.id} member={member} open={open} users={users} stats={stats} solar={solar} now={now} onClose={onClose} lead={lead} extra={extra} />;
}
