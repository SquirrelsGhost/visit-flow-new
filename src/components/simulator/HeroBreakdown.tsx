import { eur } from "../../lib/tariff/eur";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import GlassChip from "../glass/GlassChip";

interface HeroBreakdownProps {
  provision: number;
  bonus: number;
  /** z. B. "inkl. Expert +15 %" */
  levelNote?: string;
  units: string;
}

/** Herleitung unter dem großen Betrag: Provision + Bonus als Plaketten, darunter Stückzahl und Level-Aufschlag. */
export default function HeroBreakdown({ provision, bonus, levelNote, units }: HeroBreakdownProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-1.5 tabular-nums">
        <GlassChip onDeep>
          {t.hero.provision} {eur(provision)}
        </GlassChip>
        {bonus > 0 && (
          <GlassChip onDeep tone="amber">
            + {t.hero.bonus} {eur(bonus)}
          </GlassChip>
        )}
      </div>
      <p className="pt-1.5">
        {units}
        {levelNote && <span className="font-medium text-fuchsia-200"> · {levelNote}</span>}
      </p>
    </>
  );
}
