import type { DayStats } from "../../lib/battle/arenaScore";
import type { ArenaUser } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { battleTexts as t } from "../../texts/battleTexts";
import { GLASS_DIVIDER } from "../glass/glassStyles";
import ArenaSection from "./ArenaSection";
import { ARENA_CARD } from "./battleStyles";
import SectionTitle from "./SectionTitle";
import TopTodayRow from "./TopTodayRow";

interface TopTodayProps {
  dayStats: Map<string, DayStats>;
  users: ArenaUser[];
  meId: string;
}

/** Top 5 heute nach Provision, aus denselben Tageswerten wie die Battle-Scores; Balken im Vergleich zum Ersten. */
export default function TopToday({ dayStats, users, meId }: TopTodayProps) {
  const top = [...dayStats.entries()].sort((a, b) => b[1].commission - a[1].commission).slice(0, 5);
  if (top.length === 0) return null;
  const best = top[0][1].commission;
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name || "Unbekannt";
  return (
    <ArenaSection title={<SectionTitle>{t.top5}</SectionTitle>}>
      <div className={cn(ARENA_CARD, GLASS_DIVIDER)}>
        {top.map(([userId, s], i) => (
          <TopTodayRow key={userId} rank={i} name={nameOf(userId)} stats={s} best={best} me={userId === meId} />
        ))}
      </div>
    </ArenaSection>
  );
}
