import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn";

interface DeltaChipProps {
  /** Veränderung in Prozent; null ohne Vergleich. */
  change: number | null;
  /** Kurzer Zusatz, z. B. "zu den 30 Tagen davor". */
  suffix?: string;
  /** Nur Pfeil und Zahl (kleine Kennzahlen). */
  compact?: boolean;
}

const FORMAT = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0, signDisplay: "exceptZero" });

/** Plakette für den Vergleich mit dem Zeitraum davor: grün nach oben, rosa nach unten, auf dunkler Karte. */
export default function DeltaChip({ change, suffix, compact = false }: DeltaChipProps) {
  if (change === null) return null;
  const rounded = Math.round(change);
  const Icon = rounded > 0 ? TrendingUp : rounded < 0 ? TrendingDown : Minus;
  const tone = rounded > 0 ? "text-emerald-200 bg-emerald-400/15 ring-emerald-300/25" : rounded < 0 ? "text-rose-200 bg-rose-400/15 ring-rose-300/25" : "text-white/75 bg-white/[0.08] ring-white/15";
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1 truncate rounded-full font-semibold ring-1 ring-inset", compact ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]", tone)}>
      <Icon aria-hidden className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {`${FORMAT.format(rounded)} %`}
      {suffix && !compact && <span className="font-medium opacity-80">{suffix}</span>}
    </span>
  );
}
