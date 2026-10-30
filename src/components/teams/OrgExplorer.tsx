import { Loader2, SearchX, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { MemberStats } from "../../lib/overview/manageLogic";
import { riseIn } from "../../lib/motion/presets";
import type { TeamUser } from "../../lib/overview/teamTypes";
import { matchesFilter, matchesQuery, peopleIn, pruneForest } from "../../lib/teams/orgTree";
import type { OrgFilter, OrgNode, OrgScope } from "../../lib/teams/orgTypes";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassFilterChips from "../glass/GlassFilterChips";
import GlassRow from "../glass/GlassRow";
import GlassSearchField from "../glass/GlassSearchField";
import GlassSection from "../glass/GlassSection";
import { GLASS_LABEL } from "../glass/glassStyles";
import OrgBranch, { type OrgTreeContext } from "./OrgBranch";

interface OrgExplorerProps {
  nodes: readonly OrgNode[];
  scope: OrgScope;
  users: readonly TeamUser[];
  stats: Map<string, MemberStats>;
  open: ReadonlySet<string>;
  loadedTeams?: ReadonlySet<string>;
  meId: string;
  solar: boolean;
  now: Date;
  onToggle: (id: string) => void;
  onOpen: OrgTreeContext["onOpen"];
  /** Personen laden noch: statt "niemand da" ein Ladehinweis. */
  loading?: boolean;
}

const texts = teamsTexts.tree;
/** Welche Filter je Blickwinkel Sinn ergeben. */
const FILTERS: Record<OrgScope, readonly OrgFilter[]> = {
  all: ["all", "leads", "out", "unassigned", "inactive"],
  team: ["all", "leads", "out", "unassigned"],
  group: ["all", "out"],
  mentees: ["all", "out"],
};

/** Suche, Filter und der aufklappbare Baum. Bei Suche oder Filter bleiben die Treffer mit ihren Vorgesetzten stehen. */
export default function OrgExplorer({ nodes, scope, users, stats, open, loadedTeams, meId, solar, now, onToggle, onOpen, loading = false }: OrgExplorerProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrgFilter>("all");
  const byId = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const people = useMemo(() => peopleIn(nodes), [nodes]);
  const narrowed = query.trim() !== "" || filter !== "all";
  const pruned = useMemo(
    () => (narrowed ? pruneForest(nodes, (u) => matchesQuery(u, query) && matchesFilter(u, filter, byId, now)) : null),
    [narrowed, nodes, query, filter, byId, now],
  );
  const shown = pruned?.nodes ?? nodes;
  const ctx: OrgTreeContext = { stats, byId, open: pruned ? new Set([...open, ...pruned.open]) : open, loadedTeams, meId, solar, now, onToggle, onOpen };
  const options = FILTERS[scope].map((id) => ({ id, label: texts.filters[id], count: id === "all" ? people.length : people.filter((u) => matchesFilter(u, id, byId, now)).length }));

  return (
    <>
      <motion.div variants={riseIn} className="space-y-3">
        <h3 className={`${GLASS_LABEL} !pb-0`}>{texts.label}</h3>
        <GlassSearchField value={query} onChange={setQuery} placeholder={texts.search} />
        <GlassFilterChips label={texts.filtersLabel} layoutId="teams-filter" active={filter} onChange={setFilter} options={options} />
      </motion.div>
      {shown.length === 0 ? (
        <GlassSection>
          {loading && !narrowed ? (
            <GlassRow icon={Loader2} tone="gray" title={texts.loadingPeople} />
          ) : (
            <GlassRow icon={narrowed ? SearchX : Users} tone="gray" title={narrowed ? texts.empty : texts.nobody[scope]} />
          )}
        </GlassSection>
      ) : (
        <GlassSection footer={texts.footer[scope]}>
          {shown.map((node) => (
            <OrgBranch key={node.id} node={node} depth={0} ctx={ctx} />
          ))}
        </GlassSection>
      )}
    </>
  );
}
