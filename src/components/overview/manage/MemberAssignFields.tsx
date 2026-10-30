import { BadgeCheck, GraduationCap, Power, Swords, Users } from "lucide-react";
import { assignable, roleLabel } from "../../../lib/overview/manageLogic";
import { EDITABLE_ROLES, type MemberDraft } from "../../../lib/overview/memberDraft";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { manageTexts } from "../../../texts/manageTexts";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_FOOTER, GLASS_LABEL } from "../../glass/glassStyles";
import SettingsSelectRow from "../../settings/SettingsSelectRow";
import SettingsSwitchRow from "../../settings/SettingsSwitchRow";

interface MemberAssignFieldsProps {
  member: TeamUser;
  users: readonly TeamUser[];
  draft: MemberDraft;
  solar: boolean;
  onChange: (next: Partial<MemberDraft>) => void;
}

const texts = manageTexts.member;

/** Rolle, Gruppe, Mentor und Zugang (v1 Mitglied-bearbeiten-Dialog) als Glas-Zeilen. */
export default function MemberAssignFields({ member, users, draft, solar, onChange }: MemberAssignFieldsProps) {
  const { leaders, mentors } = assignable(users, member.id);
  const none = { value: "", label: texts.none };
  const canRole = (EDITABLE_ROLES as readonly string[]).includes(member.role);
  return (
    <>
      <section>
        <h3 className={GLASS_LABEL}>{texts.role}</h3>
        <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
          {canRole && (
            <SettingsSelectRow icon={BadgeCheck} tone="indigo" title={texts.role} value={draft.role} options={EDITABLE_ROLES.map((r) => ({ value: r, label: roleLabel(r, solar) }))} onChange={(role) => onChange({ role })} />
          )}
          {draft.role !== "strukturleiter" && (
            <SettingsSelectRow icon={Users} tone="blue" title={texts.group} value={draft.strukturleiterId} options={[none, ...leaders.map((l) => ({ value: l.id, label: l.name }))]} onChange={(strukturleiterId) => onChange({ strukturleiterId })} />
          )}
          <SettingsSelectRow icon={GraduationCap} tone="purple" title={solar ? texts.trainer : texts.mentor} value={draft.mentorId} options={[none, ...mentors.map((m) => ({ value: m.id, label: m.name }))]} onChange={(mentorId) => onChange({ mentorId })} />
        </div>
        {draft.role === "strukturleiter" && <p className={GLASS_FOOTER}>{texts.leaderInGroup}</p>}
      </section>
      <section>
        <h3 className={GLASS_LABEL}>{texts.access}</h3>
        <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
          <SettingsSwitchRow icon={Power} tone="green" title={texts.active} subtitle={texts.activeHint} checked={draft.isActive} onChange={() => onChange({ isActive: !draft.isActive })} />
          <SettingsSwitchRow icon={Swords} tone="red" title={texts.battle} subtitle={texts.battleHint} checked={draft.battleActive} onChange={() => onChange({ battleActive: !draft.battleActive })} />
        </div>
      </section>
    </>
  );
}
