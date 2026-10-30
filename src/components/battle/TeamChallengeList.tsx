// Suchfeld braucht State
"use client";

import { Users } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { isInBattle, sortMembers } from "../../lib/battle/battleSelectors";
import type { Challenge, StreakMap, TeamMember } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import GlassSearchField from "../glass/GlassSearchField";
import { GLASS_DIVIDER } from "../glass/glassStyles";
import ArenaSection from "./ArenaSection";
import { ARENA_CARD } from "./battleStyles";
import SectionTitle from "./SectionTitle";
import TeamMemberCard from "./TeamMemberCard";

interface TeamChallengeListProps {
  members: TeamMember[];
  battles: Challenge[];
  streaks: StreakMap;
  canManage: boolean;
  isBusy: (key: string) => boolean;
  onChallenge: (userId: string) => void;
  onManageSales: (member: TeamMember) => void;
}

/** "Team herausfordern": Suche und Liste aller battlefähigen Teammitglieder, freie zuerst, heiße Serien oben. */
export default function TeamChallengeList(props: TeamChallengeListProps) {
  const { members, battles, streaks, canManage, isBusy, onChallenge, onManageSales } = props;
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const shown = sortMembers(members, battles, streaks).filter((m) => !query || m.name.toLowerCase().includes(query));
  const free = members.filter((m) => !isInBattle(battles, m.userId)).length;
  const title = <SectionTitle action={<span className="text-[12px] font-medium text-[var(--glass-label)]">{t.teamCount(free, members.length)}</span>}>{t.teamTitle}</SectionTitle>;
  return (
    <ArenaSection title={title}>
      {members.length > 5 && <GlassSearchField value={search} onChange={setSearch} placeholder={t.search} className="mb-3" />}
      {members.length === 0 || shown.length === 0 ? (
        <div className={cn(ARENA_CARD, "flex flex-col items-center px-6 py-8 text-center")}>
          <Users aria-hidden className="h-6 w-6 text-slate-400 dark:text-white/40" />
          <p className="mt-2 text-[14px] text-muted-foreground">{t.noMembers}</p>
        </div>
      ) : (
        <div className={cn(ARENA_CARD, GLASS_DIVIDER)}>
          <AnimatePresence initial={false}>
            {shown.map((m) => (
              <TeamMemberCard
                key={m.userId}
                member={m}
                streak={streaks[m.userId]}
                active={isInBattle(battles, m.userId)}
                loading={isBusy(`challenge:${m.userId}`)}
                canManage={canManage}
                onChallenge={() => onChallenge(m.userId)}
                onManageSales={() => onManageSales(m)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </ArenaSection>
  );
}
