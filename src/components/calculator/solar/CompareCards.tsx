import type { SolarInput, SolarResult } from "../../../lib/solar/solarCalc";
import { solarTexts as t } from "../../../texts/solarTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";
import { MICRO, TILE, TILE_GREEN } from "./solarStyles";

interface CompareCardsProps {
  input: SolarInput;
  result: SolarResult;
}

/** Monatlich heute (Netzstrom) gegen neu (mit Solar). */
export default function CompareCards({ input, result }: CompareCardsProps) {
  const sub = input.mode === "miete" ? t.neuSub.miete : input.financed ? t.neuSub.kredit : t.neuSub.cash;
  return (
    <div className="grid shrink-0 grid-cols-2 gap-3">
      <div className={`${TILE} p-4`}>
        <span className={`block ${MICRO}`}>{t.alt}</span>
        <span className="mt-1 block text-[20px] font-semibold tracking-[-0.02em] tabular-nums">
          <AnimatedEuro value={result.altMonthlyCost} />
          <span className="text-[10px] font-normal text-muted-foreground">{t.perMonth}</span>
        </span>
        <span className="mt-1 block text-[11px] text-muted-foreground">{t.altSub}</span>
      </div>
      <div className={`${TILE_GREEN} relative overflow-hidden p-4`}>
        <span className={`block ${MICRO} !text-emerald-700 dark:!text-emerald-300`}>{t.neu}</span>
        <span className="mt-1 block text-[20px] font-semibold tracking-[-0.02em] tabular-nums text-emerald-700 dark:text-emerald-300">
          <AnimatedEuro value={result.newMonthlyCost} />
          <span className="text-[10px] font-normal">{t.perMonth}</span>
        </span>
        <span className="mt-1 block text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
