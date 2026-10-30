import { Calendar, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMeMetrics } from "../../../hooks/useMeMetrics";
import { useVertical } from "../../../hooks/useVertical";
import { staggerParent } from "../../../lib/motion/presets";
import { meTexts as t } from "../../../texts/assistantTexts";
import GlassFlow from "../../glass/GlassFlow";
import GlassFlowItem from "../../glass/GlassFlowItem";
import BonusCard from "./BonusCard";
import ChallengeGroup from "./ChallengeGroup";
import GoalsCard from "./GoalsCard";
import LeadBonusCard from "./LeadBonusCard";
import MeState from "./MeState";
import MonthGoalCard from "./MonthGoalCard";
import MotivationBanner from "./MotivationBanner";
import RevenueHero from "./RevenueHero";

/** Reiter "Ich" (v1 DashboardTab): Provision, Zuspruch, Monatsziel, Ziele, Bonus (Lead: Lead-Bonus) und Challenges. */
export interface MeTabProps { readonly _?: never; }

export default function MeTab() {
  const m = useMeMetrics();
  const vertical = useVertical();
  if (m === undefined) return <MeState loading />;
  if (m === null) return <MeState />;

  const daily = m.challenges.filter((c) => c.type === "daily");
  const weekly = m.challenges.filter((c) => c.type === "weekly");

  return (
    <motion.div className="space-y-4" variants={staggerParent(0.07, 0.05)} initial="hidden" animate="show">
      <RevenueHero m={m} />
      <GlassFlow gap="tight">
        <GlassFlowItem>
          <MotivationBanner m={m} vertical={vertical} />
        </GlassFlowItem>
        {m.monthGoal && (
          <GlassFlowItem>
            <MonthGoalCard m={m} goal={m.monthGoal} />
          </GlassFlowItem>
        )}
        {vertical === "telco" && (
          <GlassFlowItem col="right">
            <GoalsCard m={m} />
          </GlassFlowItem>
        )}
        {vertical === "telco" && (
          <GlassFlowItem col="right">
            <BonusCard m={m} />
          </GlassFlowItem>
        )}
        {vertical === "solar" && (
          <GlassFlowItem col="right">
            <LeadBonusCard m={m} />
          </GlassFlowItem>
        )}
      </GlassFlow>
      {daily.length > 0 && (
        <ChallengeGroup
          title={t.dailyChallenges}
          icon={Zap}
          iconTone="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
          challenges={daily}
          columns="md:grid-cols-3"
        />
      )}
      {weekly.length > 0 && (
        <ChallengeGroup
          title={t.weeklyChallenges}
          icon={Calendar}
          iconTone="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
          challenges={weekly}
          columns="md:grid-cols-2"
        />
      )}
    </motion.div>
  );
}
