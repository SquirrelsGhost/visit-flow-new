import type { Vertical } from "../../../lib/battle/battleCategories";
import type { TodayStats } from "../../../lib/overview/todayStats";
import { overviewTexts } from "../../../texts/overviewTexts";
import { motion } from "motion/react";
import { riseIn } from "../../../lib/motion/presets";
import { GLASS_CARD, GLASS_LABEL } from "../../glass/glassStyles";
import FunnelStep from "./FunnelStep";

interface FunnelCardProps {
  stats: TodayStats;
  vertical: Vertical;
}

const texts = overviewTexts.today;

/** Trichter Türen, Angetroffen, Abschluss: zeigt auf einen Blick, wo der Tag hängt. */
export default function FunnelCard({ stats, vertical }: FunnelCardProps) {
  const of = (count: number) => (stats.doors > 0 ? count / stats.doors : 0);
  return (
    <motion.section variants={riseIn} className="flex flex-col">
      <h3 className={GLASS_LABEL}>{texts.funnel}</h3>
      <div className={`${GLASS_CARD} flex flex-1 flex-col justify-center space-y-2 p-4`}>
        <FunnelStep label={texts.doors} count={stats.doors} share={stats.doors > 0 ? 1 : 0} tone="from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-700" delay={0.1} />
        <FunnelStep label={texts.met} count={stats.met} share={of(stats.met)} tone="from-sky-400 to-indigo-500" delay={0.25} />
        <FunnelStep label={texts.sales[vertical]} count={stats.saleDoors} share={of(stats.saleDoors)} tone="from-emerald-400 to-emerald-600" delay={0.4} />
      </div>
    </motion.section>
  );
}
