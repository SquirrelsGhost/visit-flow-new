import type { GlassNumberKind } from "../../lib/glass/glassNumber";
import GlassNumber from "../glass/GlassNumber";
import DeltaChip from "./DeltaChip";

interface HeroMetricProps {
  label: string;
  value: number;
  kind?: GlassNumberKind;
  change: number | null;
}

/** Kleine Kennzahl unten auf der Kopfkarte: Beschriftung, Zahl, Veränderung zum Zeitraum davor. */
export default function HeroMetric({ label, value, kind = "int", change }: HeroMetricProps) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
      <GlassNumber value={value} kind={kind} className="mt-1.5 text-[22px] font-semibold leading-none tracking-[-0.02em] text-white" />
      <div className="mt-2 h-5">
        <DeltaChip change={change} compact />
      </div>
    </div>
  );
}
