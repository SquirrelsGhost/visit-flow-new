import type { SolarSell } from "../../../hooks/useSolarPencilSell";
import { solarTexts as t } from "../../../texts/solarTexts";
import { CALC_CARD } from "../calcGlass";
import StepHead from "../StepHead";
import AutoOptimizeBanner from "./AutoOptimizeBanner";
import RoofOrientation from "./RoofOrientation";
import SolarSliders from "./SolarSliders";

interface SystemStepProps {
  sell: SolarSell;
}

/** Schritt 1 "Anlage": Verbrauch, Dachfläche, Speicher und Ausrichtung, mit "Optimieren" oben rechts. */
export default function SystemStep({ sell }: SystemStepProps) {
  return (
    <section aria-label={t.anlage} className={`${CALC_CARD} space-y-5`}>
      <StepHead schritt={1} titel={t.anlage} hinweis={t.anlageHint} fertig trailing={<AutoOptimizeBanner onOptimize={sell.optimize} />} />
      <SolarSliders sell={sell} />
      <div className="h-px bg-[var(--glass-divider)]" />
      <RoofOrientation value={sell.input.orientation} onChange={(orientation) => sell.set({ orientation })} />
    </section>
  );
}
