import { solarTexts as t } from "../../../texts/solarTexts";
import { CALC_TILE } from "../calcGlass";

interface StatTilesProps {
  autarky: number;
  co2: number;
}

/** Autarkie und CO₂-Ersparnis auf einen Blick. */
export default function StatTiles({ autarky, co2 }: StatTilesProps) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 text-center text-xs">
      <div className={`${CALC_TILE} p-3`}>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]">{t.autarky}</span>
        <span className="mt-1 block text-[18px] font-semibold tabular-nums text-blue-600 dark:text-blue-400">{autarky}%</span>
      </div>
      <div className={`${CALC_TILE} p-3`}>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]">{t.co2}</span>
        <span className="mt-1 block text-[18px] font-semibold tabular-nums text-teal-600 dark:text-teal-400">{t.co2Value(co2)}</span>
      </div>
    </div>
  );
}
