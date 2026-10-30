import { CircleCheck, Flame, HeartPulse, TrendingDown } from "lucide-react";
import type { TeamPulse } from "../../../lib/overview/manageLogic";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import GlassRow from "../../glass/GlassRow";
import GlassSection from "../../glass/GlassSection";

interface ManageAlertsProps {
  pulse: TeamPulse;
  onAbsent: () => void;
}

const texts = manageTexts.alerts;
const firstNames = (names: readonly { name: string }[], max = 3) =>
  names.slice(0, max).map((u) => u.name.split(" ")[0]).join(", ") + (names.length > max ? ` +${names.length - max}` : "");

/** Was der Teamleiter heute wissen muss (v1 alerts): Ausfälle, wer noch nichts hat, wer glänzt. */
export default function ManageAlerts({ pulse, onAbsent }: ManageAlertsProps) {
  const quiet = pulse.noSales.length === 0 && pulse.absent.length === 0 && pulse.topToday.length === 0;
  return (
    <GlassSection label={texts.label}>
      {pulse.topToday.length > 0 && <GlassRow icon={Flame} tone="orange" title={fill(texts.top, { names: firstNames(pulse.topToday) })} />}
      {pulse.absent.length > 0 && (
        <GlassRow
          icon={HeartPulse}
          tone="rose"
          title={pulse.absent.length === 1 ? texts.absentOne : fill(texts.absent, { count: pulse.absent.length })}
          subtitle={firstNames(pulse.absent)}
          onClick={onAbsent}
        />
      )}
      {pulse.noSales.length > 0 && (
        <GlassRow
          icon={TrendingDown}
          tone="amber"
          title={pulse.noSales.length === 1 ? texts.noSalesOne : fill(texts.noSales, { count: pulse.noSales.length })}
          subtitle={firstNames(pulse.noSales)}
        />
      )}
      {quiet && <GlassRow icon={CircleCheck} tone="green" title={texts.allGood} />}
    </GlassSection>
  );
}
