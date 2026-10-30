import { Ban, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TeamUser } from "../../lib/overview/teamTypes";
import { updateAsAdmin } from "../../lib/teams/orgApi";
import type { OrgTeam } from "../../lib/teams/orgTypes";
import { fill } from "../../texts/profileTexts";
import { teamsTexts } from "../../texts/teamsTexts";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_LABEL } from "../glass/glassStyles";
import SettingsSelectRow from "../settings/SettingsSelectRow";
import SettingsSwitchRow from "../settings/SettingsSwitchRow";

interface OrgAdminFieldsProps {
  member: TeamUser;
  teams: readonly OrgTeam[];
}

const texts = teamsTexts.admin;

/** Nur für Admins (v1 PATCH /admin/users/:id): Team wechseln und Konto sperren. Beides speichert sofort. */
export default function OrgAdminFields({ member, teams }: OrgAdminFieldsProps) {
  const [teamId, setTeamId] = useState(member.teamId ?? "");
  const [blocked, setBlocked] = useState(member.isBlocked === true);
  const first = member.name.split(" ")[0] ?? member.name;
  const options = [...(teamId ? [] : [{ value: "", label: teamsTexts.tree.noTeam }]), ...teams.map((t) => ({ value: t.id, label: t.name }))];

  const move = async (next: string) => {
    if (next === teamId) return;
    // Gruppe und Mentor gehören zum alten Team und fallen beim Wechsel weg
    const ok = await updateAsAdmin(member.id, { teamId: next || null, strukturleiterId: null, mentorId: null }).catch(() => false);
    if (!ok) return void toast.error(texts.failed);
    setTeamId(next);
    toast.success(fill(texts.moved, { name: first, team: teams.find((t) => t.id === next)?.name ?? teamsTexts.tree.noTeam }));
  };
  const block = async () => {
    const ok = await updateAsAdmin(member.id, { isBlocked: !blocked, blockReason: null }).catch(() => false);
    if (!ok) return void toast.error(texts.failed);
    toast.success(fill(blocked ? texts.unblocked : texts.blocked, { name: first }));
    setBlocked(!blocked);
  };

  return (
    <section>
      <h3 className={GLASS_LABEL}>{texts.label}</h3>
      <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
        <SettingsSelectRow icon={Users} tone="red" title={texts.team} value={teamId} options={options} onChange={(next) => void move(next)} />
        <SettingsSwitchRow icon={Ban} tone="rose" title={texts.block} subtitle={texts.blockHint} checked={blocked} onChange={() => void block()} warn={blocked} />
      </div>
    </section>
  );
}
