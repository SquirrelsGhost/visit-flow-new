import { roleLabel, strukturGroups } from "../../../lib/overview/manageLogic";
import type { ContestDraft } from "../../../lib/overview/contestForm";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { contestFormTexts as texts } from "../../../texts/contestFormTexts";
import { fill } from "../../../texts/profileTexts";
import GlassFilterChips from "../../glass/GlassFilterChips";
import { GLASS_LABEL } from "../../glass/glassStyles";
import ContestPickList from "./ContestPickList";

interface ContestWhoFieldProps {
  draft: ContestDraft;
  users: readonly TeamUser[];
  solar: boolean;
  onChange: (next: Partial<ContestDraft>) => void;
}

const KINDS = ["all", "groups", "individual"] as const;

/** Wer mitspielt: ganzes Team, Strukturleiter-Gruppen oder einzelne Personen (nur aktive mit Battle). */
export default function ContestWhoField({ draft, users, solar, onChange }: ContestWhoFieldProps) {
  const players = users.filter((u) => u.isActive !== false && u.battleInactive !== true);
  const { groups } = strukturGroups(users);
  return (
    <section className="space-y-3">
      <h3 className={`${GLASS_LABEL} !pb-0`}>{texts.who}</h3>
      <GlassFilterChips label={texts.who} layoutId="contest-who" active={draft.type} onChange={(type) => onChange({ type })} options={KINDS.map((id) => ({ id, label: texts.kinds[id] }))} />
      {draft.type === "groups" && (
        <ContestPickList
          label={texts.pickGroups}
          selected={draft.strukturleiterIds}
          onChange={(strukturleiterIds) => onChange({ strukturleiterIds })}
          options={groups.map(({ leader, members }) => ({ id: leader.id, title: leader.name, subtitle: `${roleLabel(leader.role, solar)} · ${fill(texts.groupMembers, { count: members.length })}` }))}
        />
      )}
      {draft.type === "individual" && (
        <ContestPickList
          label={texts.pickPeople}
          selected={draft.selectedUserIds}
          onChange={(selectedUserIds) => onChange({ selectedUserIds })}
          options={players.map((u) => ({ id: u.id, title: u.name, subtitle: roleLabel(u.role, solar) }))}
        />
      )}
    </section>
  );
}
