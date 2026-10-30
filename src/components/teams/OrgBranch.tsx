import { AnimatePresence, motion } from "motion/react";
import type { MemberStats } from "../../lib/overview/manageLogic";
import { statsOf } from "../../lib/overview/manageLogic";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { TeamUser } from "../../lib/overview/teamTypes";
import { can } from "../../lib/permissions";
import { totalsOf } from "../../lib/teams/orgTree";
import type { OrgNode } from "../../lib/teams/orgTypes";
import { fill } from "../../texts/profileTexts";
import { teamsTexts } from "../../texts/teamsTexts";
import { GLASS_DIVIDER } from "../glass/glassStyles";
import OrgPersonRow from "./OrgPersonRow";
import OrgTeamRow from "./OrgTeamRow";
import OrgToggle from "./OrgToggle";

/** Was jeder Ast braucht; einmal oben gebaut und durchgereicht. */
export interface OrgTreeContext {
  stats: Map<string, MemberStats>;
  byId: ReadonlyMap<string, TeamUser>;
  open: ReadonlySet<string>;
  /** Teams, deren Zahlen schon geladen sind (Admin). */
  loadedTeams?: ReadonlySet<string>;
  meId: string;
  solar: boolean;
  now: Date;
  onToggle: (id: string) => void;
  /** undefined: diese Person lässt sich hier nicht bearbeiten. */
  onOpen: (user: TeamUser) => (() => void) | undefined;
}

interface OrgBranchProps {
  node: OrgNode;
  depth: number;
  /** Person direkt darüber (für den Mentor-Hinweis). */
  parentId?: string;
  ctx: OrgTreeContext;
}

const texts = teamsTexts.tree;

/** Ein Knoten mit seinen Personen darunter; die Äste gleiten weich auf und zu, eine feine Linie zeigt, wer wohin gehört. */
export default function OrgBranch({ node, depth, parentId, ctx }: OrgBranchProps) {
  const open = ctx.open.has(node.id);
  const hasKids = node.children.length > 0;
  const totals = totalsOf(node, ctx.stats, ctx.now);
  const name = node.kind === "team" ? node.team.name : node.user.name;
  const toggle = () => ctx.onToggle(node.id);

  let row;
  if (node.kind === "team") {
    const head = node.children.find((c) => c.kind === "person" && can(c.user, "team:licensing") && !can(c.user, "admin:*"));
    const leader = (node.team.leaderId ? ctx.byId.get(node.team.leaderId) : undefined) ?? (head?.kind === "person" ? head.user : undefined);
    row = <OrgTeamRow team={node.team} leaderName={leader?.name} totals={totals} hasNumbers={ctx.loadedTeams?.has(node.team.id) ?? true} onToggle={toggle} />;
  } else {
    // Mentor nur nennen, wenn er nicht ohnehin direkt darüber steht
    const mentor = node.user.mentorId && node.user.mentorId !== parentId ? ctx.byId.get(node.user.mentorId) : undefined;
    row = (
      <OrgPersonRow
        user={node.user}
        stats={statsOf(ctx.stats, node.id)}
        totals={hasKids ? totals : undefined}
        mentorName={mentor?.name}
        isMe={node.id === ctx.meId}
        solar={ctx.solar}
        now={ctx.now}
        nested={depth > 0}
        onOpen={ctx.onOpen(node.user)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center">
        {row}
        {hasKids && <OrgToggle open={open} label={fill(open ? texts.close : texts.open, { name })} onToggle={toggle} />}
      </div>
      <AnimatePresence initial={false}>
        {open && hasKids && (
          <motion.div key="children" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SOFT_SPRING} className="overflow-hidden">
            <div className={`ml-[1.65rem] border-l border-[var(--glass-divider)] ${GLASS_DIVIDER}`}>
              {node.children.map((child) => (
                <OrgBranch key={child.id} node={child} depth={depth + 1} parentId={node.kind === "person" ? node.id : undefined} ctx={ctx} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
