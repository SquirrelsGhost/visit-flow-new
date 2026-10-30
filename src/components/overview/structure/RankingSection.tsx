import { CalendarDays, CalendarRange, Sun } from "lucide-react";
import { motion } from "motion/react";
import { riseIn } from "../../../lib/motion/presets";
import type { RankedMember, StructureLens, StructurePeriod } from "../../../lib/overview/structureLogic";
import { statsOf, type MemberStats } from "../../../lib/overview/manageLogic";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { fill } from "../../../texts/profileTexts";
import { structureTexts as texts } from "../../../texts/structureTexts";
import GlassSection from "../../glass/GlassSection";
import GlassSegmented from "../../glass/GlassSegmented";
import { GLASS_LABEL } from "../../glass/glassStyles";
import RankingRow from "./RankingRow";

interface RankingSectionProps {
  lens: StructureLens;
  period: StructurePeriod;
  ranked: readonly RankedMember[];
  now: Date;
  stats: Map<string, MemberStats>;
  onPeriod: (period: StructurePeriod) => void;
  onOpen: (member: TeamUser) => void;
}

const ICONS = { day: Sun, week: CalendarRange, month: CalendarDays } as const;

/** Rangliste der Gruppe für Heute, Woche oder Monat (v1 Auswertungen). */
export default function RankingSection({ lens, period, ranked, now, stats, onPeriod, onOpen }: RankingSectionProps) {
  const best = Math.max(1, ...ranked.map((r) => r.sales));
  return (
    <div className="space-y-3">
      <motion.div variants={riseIn} className="space-y-3">
        <h3 className={`${GLASS_LABEL} !pb-0`}>{texts.ranking}</h3>
        <GlassSegmented label={texts.periodsLabel} idPrefix="structure-period" tone="soft" active={period} onChange={onPeriod} segments={(["day", "week", "month"] as const).map((id) => ({ id, label: texts.periods[id], icon: ICONS[id] }))} />
      </motion.div>
      <GlassSection footer={texts.rankingFooter[lens]}>
        {/* Sortiert nach Abschlüssen: Platz = Position, wer nichts hat, bekommt einen Strich statt Platz */}
        {ranked.map((entry, i) => (
          <RankingRow key={entry.member.id} entry={entry} rank={i + 1} share={entry.sales / best} subtitle={
              period === "day"
                ? fill(texts.dayLine, { doors: statsOf(stats, entry.member.id).doorsToday })
                : fill(texts.periodLine, { count: statsOf(stats, entry.member.id).salesToday, yesterday: entry.yesterday })
            } now={now} onOpen={() => onOpen(entry.member)} />
        ))}
      </GlassSection>
    </div>
  );
}
