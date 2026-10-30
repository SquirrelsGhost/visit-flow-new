import { GraduationCap, Shield, Users } from "lucide-react";
import type { Vertical } from "../../lib/battle/battleCategories";
import type { ProfileData, SaveProfile } from "../../lib/profile/profileTypes";
import { roleLabel } from "../../texts/appTexts";
import { profileTexts } from "../../texts/profileTexts";
import SettingsGroup from "../settings/SettingsGroup";
import SettingsRow from "../settings/SettingsRow";
import VpknRow from "./VpknRow";

interface RoleTeamGroupProps {
  profile: ProfileData;
  teamName: string | undefined;
  vertical: Vertical;
  onSave: SaveProfile;
}

const texts = profileTexts.role;

/** Rolle, Team, Mentor und (Telco) VPKN, wie der v1-Reiter Rolle; ohne rohe Team-ID. */
export default function RoleTeamGroup({ profile, teamName, vertical, onSave }: RoleTeamGroupProps) {
  return (
    <SettingsGroup label={profileTexts.groups.role}>
      <SettingsRow icon={Shield} tone="orange" title={texts.role} value={roleLabel(profile.role)} />
      <SettingsRow icon={Users} tone="green" title={texts.team} value={teamName ?? profileTexts.noTeam} />
      {profile.mentorId && <SettingsRow icon={GraduationCap} tone="blue" title={texts.mentor} value={profile.mentorId} />}
      {vertical === "telco" && <VpknRow vpkn={profile.vpkn} onSave={onSave} />}
    </SettingsGroup>
  );
}
