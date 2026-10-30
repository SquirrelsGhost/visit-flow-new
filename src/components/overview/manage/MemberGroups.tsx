import type { ReactNode } from "react";
import { roleLabel, statsOf, strukturGroups, type MemberStats } from "../../../lib/overview/manageLogic";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import GroupCard from "./GroupCard";

interface MemberGroupsProps {
  users: readonly TeamUser[];
  stats: Map<string, MemberStats>;
  solar: boolean;
  row: (member: TeamUser) => ReactNode;
}

const texts = manageTexts.list;
const salesOf = (members: readonly TeamUser[], stats: Map<string, MemberStats>) => members.reduce((sum, m) => sum + statsOf(stats, m.id).salesToday, 0);

/** Strukturleiter-Gruppen untereinander, der Leiter steht oben in seiner Gruppe; danach alle ohne Gruppe. */
export default function MemberGroups({ users, stats, solar, row }: MemberGroupsProps) {
  const { groups, unassigned } = strukturGroups(users);
  return (
    <div className="space-y-3">
      {groups.map(({ leader, members }) => (
        <GroupCard
          key={leader.id}
          title={fill(texts.group, { name: leader.name.split(" ")[0] ?? leader.name }) + ` · ${roleLabel(leader.role, solar)}`}
          count={members.length + 1}
          salesToday={salesOf([leader, ...members], stats)}
          head={row(leader)}
        >
          {members.map(row)}
        </GroupCard>
      ))}
      {unassigned.length > 0 && (
        <GroupCard title={texts.unassigned} count={unassigned.length} salesToday={salesOf(unassigned, stats)}>
          {unassigned.map(row)}
        </GroupCard>
      )}
    </div>
  );
}
