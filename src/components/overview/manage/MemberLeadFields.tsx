import { CalendarCheck, GraduationCap, UserMinus } from "lucide-react";
import { assignable } from "../../../lib/overview/manageLogic";
import type { MemberDraft } from "../../../lib/overview/memberDraft";
import type { StructureLens } from "../../../lib/overview/structureLogic";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { manageTexts } from "../../../texts/manageTexts";
import { structureTexts } from "../../../texts/structureTexts";
import GlassRow from "../../glass/GlassRow";
import { GLASS_CARD, GLASS_DIVIDER } from "../../glass/glassStyles";
import SettingsSelectRow from "../../settings/SettingsSelectRow";

interface MemberLeadFieldsProps {
  member: TeamUser;
  users: readonly TeamUser[];
  draft: MemberDraft;
  lens: StructureLens;
  solar: boolean;
  onChange: (next: Partial<MemberDraft>) => void;
  onRemove: () => void;
}

/** Was Strukturleiter und Mentoren an ihren Leuten ändern dürfen: Mentor (nur Struktur), Tagesstatus-Seite, Entfernen. */
export default function MemberLeadFields({ member, users, draft, lens, solar, onChange, onRemove }: MemberLeadFieldsProps) {
  const { mentors } = assignable(users, member.id);
  return (
    <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
      {lens === "structure" && (
        <SettingsSelectRow
          icon={GraduationCap}
          tone="purple"
          title={solar ? manageTexts.member.trainer : manageTexts.member.mentor}
          value={draft.mentorId}
          options={[{ value: "", label: manageTexts.member.none }, ...mentors.map((m) => ({ value: m.id, label: m.name }))]}
          onChange={(mentorId) => onChange({ mentorId })}
        />
      )}
      <GlassRow icon={CalendarCheck} tone="green" title={structureTexts.toDailyStatus} subtitle={structureTexts.toDailyStatusHint} href="/daily-status" />
      <GlassRow icon={UserMinus} tone="rose" title={structureTexts.remove[lens]} onClick={onRemove} warn />
    </div>
  );
}
