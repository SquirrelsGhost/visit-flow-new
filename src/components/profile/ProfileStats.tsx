import { ReceiptText } from "lucide-react";
import { motion } from "motion/react";
import type { MeMetrics } from "../../lib/assistant/meTypes";
import type { Vertical } from "../../lib/battle/battleCategories";
import { riseIn } from "../../lib/motion/presets";
import { fill, profileTexts } from "../../texts/profileTexts";
import GlassNumber from "../glass/GlassNumber";
import GlassRow from "../glass/GlassRow";
import GlassStat from "../glass/GlassStat";
import { GLASS_CARD, GLASS_FOOTER, GLASS_LABEL } from "../glass/glassStyles";
import StatTile from "./StatTile";

interface ProfileStatsProps {
  metrics: MeMetrics | null | undefined;
  vertical: Vertical;
}

const texts = profileTexts.stats;
const ABRECHNUNG_HREF = "/abrechnung";
const DASH = "–";
const LINE = "border-[var(--glass-divider)]";

/**
 * Tageszahlen aus v1 ("Meine Übersicht"), bewusst knapp: Monatsverdienst und Abgleich stehen in der Abrechnung,
 * Ziele und Boni im Assistenten. Der Monatsbetrag steht groß wie ein Kontostand, die Tageszahlen darunter.
 */
export default function ProfileStats({ metrics, vertical }: ProfileStatsProps) {
  const footer = metrics === null ? texts.empty : metrics && metrics.pointRelevantSales > 0 ? fill(texts.pointRelevant, { count: metrics.pointRelevantSales }) : null;
  return (
    <motion.section variants={riseIn} className="flex flex-col">
      <h3 className={GLASS_LABEL}>{profileTexts.groups.today}</h3>
      <div className={`${GLASS_CARD} flex flex-1 flex-col justify-between`}>
        <GlassStat label={texts.month} size="hero" className="px-5 pb-5 pt-5">
          {metrics ? <GlassNumber value={metrics.monthRevenue} kind="euro" duration={1.6} /> : DASH}
        </GlassStat>
        <div className={`grid grid-cols-2 divide-x border-t ${LINE} divide-[var(--glass-divider)]`}>
          <StatTile label={texts.sales[vertical]}>{metrics ? <GlassNumber value={metrics.todaySales} duration={0.9} /> : DASH}</StatTile>
          <StatTile label={texts.commission}>{metrics ? <GlassNumber value={metrics.todayRevenue} kind="euro" duration={1.2} /> : DASH}</StatTile>
        </div>
        <div className={`border-t ${LINE}`}>
          <GlassRow icon={ReceiptText} tone="green" title={texts.toAbrechnung} subtitle={texts.toAbrechnungText} href={ABRECHNUNG_HREF} />
        </div>
      </div>
      {footer && <p className={GLASS_FOOTER}>{footer}</p>}
    </motion.section>
  );
}
