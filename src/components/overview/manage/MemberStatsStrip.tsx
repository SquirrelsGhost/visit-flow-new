import type { MemberStats } from "../../../lib/overview/manageLogic";
import { manageTexts } from "../../../texts/manageTexts";
import GlassNumber from "../../glass/GlassNumber";
import GlassStat from "../../glass/GlassStat";
import { GLASS_INSET } from "../../glass/glassStyles";

interface MemberStatsStripProps {
  stats: MemberStats;
}

const texts = manageTexts.member;

/** Vier Kennzahlen der Person in einer eingelassenen Leiste. */
export default function MemberStatsStrip({ stats }: MemberStatsStripProps) {
  return (
    <div className={`${GLASS_INSET} grid grid-cols-4 gap-2 px-3.5 py-3`}>
      <GlassStat label={texts.statsToday}>
        <GlassNumber value={stats.salesToday} />
      </GlassStat>
      <GlassStat label={texts.statsDoors}>
        <GlassNumber value={stats.doorsToday} />
      </GlassStat>
      <GlassStat label={texts.statsQuote}>
        <GlassNumber value={stats.conversion} kind="percent" />
      </GlassStat>
      <GlassStat label={texts.statsMonth}>
        <GlassNumber value={stats.salesMonth} />
      </GlassStat>
    </div>
  );
}
