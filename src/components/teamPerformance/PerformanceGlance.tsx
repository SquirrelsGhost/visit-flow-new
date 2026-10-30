import { CalendarDays, Gauge, Trophy } from "lucide-react";
import type { Vertical } from "../../lib/battle/battleCategories";
import { eur } from "../../lib/tariff/eur";
import { activeDaysOf, averagePerActiveDay, bestDayOf, formatPerfDay, type PerformanceDay, type Period } from "../../lib/team/teamPerformance";
import { fill } from "../../texts/profileTexts";
import { teamPerformanceTexts as texts } from "../../texts/teamPerformanceTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

interface PerformanceGlanceProps {
  days: readonly PerformanceDay[];
  period: Period;
  vertical: Vertical;
}

const INT = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

/** Drei Zeilen, die der Verlauf allein nicht sofort zeigt: bester Tag, Schnitt je Arbeitstag, aktive Tage. */
export default function PerformanceGlance({ days, period, vertical }: PerformanceGlanceProps) {
  const best = bestDayOf(days, "umsatz");
  const active = activeDaysOf(days).length;
  const average = fill(texts.averageValue, {
    visits: INT.format(averagePerActiveDay(days, "visits")),
    sales: INT.format(averagePerActiveDay(days, "sales")),
    salesLabel: texts.sales[vertical],
  });
  return (
    <GlassSection label={texts.glance}>
      <GlassRow icon={Trophy} tone="amber" title={texts.bestDay} subtitle={best ? `${formatPerfDay(best.date)} · ${INT.format(best.sales)} ${texts.sales[vertical]}` : texts.bestDayNone} value={best ? eur(best.umsatz) : undefined} />
      <GlassRow icon={Gauge} tone="blue" title={texts.average} subtitle={average} value={eur(Math.round(averagePerActiveDay(days, "umsatz")))} />
      <GlassRow icon={CalendarDays} tone="purple" title={texts.activeDays} subtitle={texts.activeDaysHint} value={fill(texts.activeDaysValue, { active, days: period })} />
    </GlassSection>
  );
}
