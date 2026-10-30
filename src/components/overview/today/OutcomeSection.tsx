import { CalendarClock, CheckCircle2, DoorClosed, ShieldCheck, XCircle } from "lucide-react";
import type { Vertical } from "../../../lib/battle/battleCategories";
import type { TodayStats } from "../../../lib/overview/todayStats";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";
import GlassSection from "../../glass/GlassSection";
import OutcomeRow from "./OutcomeRow";

interface OutcomeSectionProps {
  stats: TodayStats;
  vertical: Vertical;
}

const texts = overviewTexts.today;
const share = (count: number, total: number) => fill(texts.share, { share: total > 0 ? Math.round((count / total) * 100) : 0 });

/** Wie die Türen heute ausgegangen sind, vom Abschluss bis "nicht angetroffen" (v1 DailyStatsCards, ohne Kachelwirrwarr). */
export default function OutcomeSection({ stats, vertical }: OutcomeSectionProps) {
  const total = stats.doors;
  return (
    <GlassSection label={texts.outcomes} footer={texts.outcomesFooter}>
      <OutcomeRow icon={CheckCircle2} tone="green" title={texts.sales[vertical]} subtitle={fill(texts.salesHint[vertical], { count: stats.products })} count={stats.saleDoors} total={total} />
      <OutcomeRow icon={CalendarClock} tone="blue" title={texts.appointments} subtitle={share(stats.appointments, total)} count={stats.appointments} total={total} />
      <OutcomeRow icon={ShieldCheck} tone="indigo" title={texts.supplied[vertical]} subtitle={share(stats.supplied, total)} count={stats.supplied} total={total} />
      <OutcomeRow icon={XCircle} tone="red" title={texts.noInterest} subtitle={share(stats.noInterest, total)} count={stats.noInterest} total={total} />
      <OutcomeRow icon={DoorClosed} tone="gray" title={texts.notMet} subtitle={share(stats.notMet, total)} count={stats.notMet} total={total} />
    </GlassSection>
  );
}
