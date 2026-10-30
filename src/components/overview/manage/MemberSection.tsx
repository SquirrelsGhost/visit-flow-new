import { motion } from "motion/react";
import { forwardRef } from "react";
import { riseIn } from "../../../lib/motion/presets";
import { filterMembers, statsOf, strukturGroups, type ManageFilter, type MemberStats } from "../../../lib/overview/manageLogic";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { manageTexts } from "../../../texts/manageTexts";
import GlassFilterChips from "../../glass/GlassFilterChips";
import GlassSearchField from "../../glass/GlassSearchField";
import GlassSection from "../../glass/GlassSection";
import { GLASS_FOOTER, GLASS_LABEL } from "../../glass/glassStyles";
import MemberGroups from "./MemberGroups";
import MemberRow from "./MemberRow";

interface MemberSectionProps {
  users: readonly TeamUser[];
  stats: Map<string, MemberStats>;
  solar: boolean;
  now: Date;
  filter: ManageFilter;
  query: string;
  onFilter: (filter: ManageFilter) => void;
  onQuery: (query: string) => void;
  onOpen: (member: TeamUser) => void;
}

const texts = manageTexts.list;
const FILTERS: readonly ManageFilter[] = ["all", "groups", "unassigned", "out", "leads"];

/** Teamliste mit Suche und Filtern (v1 Mitglieder-Bereich); "Gruppen" zeigt die Strukturleiter-Gruppen. */
const MemberSection = forwardRef<HTMLDivElement, MemberSectionProps>(function MemberSection({ users, stats, solar, now, filter, query, onFilter, onQuery, onOpen }, ref) {
  const list = filterMembers(users, filter, query, stats, now);
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "groups" ? strukturGroups(users).groups.length : filterMembers(users, f, "", stats, now).length]));
  const row = (member: TeamUser) => <MemberRow key={member.id} member={member} stats={statsOf(stats, member.id)} solar={solar} now={now} onOpen={onOpen} />;

  return (
    <div ref={ref} className="scroll-mt-24 space-y-3">
      <motion.div variants={riseIn} className="space-y-3">
        <h3 className={`${GLASS_LABEL} !pb-0`}>{texts.label}</h3>
        <GlassSearchField value={query} onChange={onQuery} placeholder={texts.search} />
        <GlassFilterChips label={texts.filtersLabel} layoutId="manage-filter" active={filter} onChange={onFilter} options={FILTERS.map((id) => ({ id, label: texts.filters[id], count: counts[id] }))} />
      </motion.div>
      {list.length === 0 ? (
        <p className={GLASS_FOOTER}>{texts.empty}</p>
      ) : filter === "groups" ? (
        <MemberGroups users={list} stats={stats} solar={solar} row={row} />
      ) : (
        <GlassSection footer={texts.footer}>{list.map(row)}</GlassSection>
      )}
    </div>
  );
});

export default MemberSection;
