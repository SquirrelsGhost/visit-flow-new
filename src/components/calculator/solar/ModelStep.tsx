import type { SolarSell } from "../../../hooks/useSolarPencilSell";
import { solarTexts as t } from "../../../texts/solarTexts";
import Reveal from "../../ui/Reveal";
import { CALC_CARD } from "../calcGlass";
import StepHead from "../StepHead";
import AdvancedSettings from "./AdvancedSettings";
import ModeToggle from "./ModeToggle";
import PaymentToggle from "./PaymentToggle";

interface ModelStepProps {
  sell: SolarSell;
}

/** Schritt 2 "Modell & Preise": Miete oder Kauf, beim Kauf die Zahlungsweise, darunter Strompreis und Einspeisung. */
export default function ModelStep({ sell }: ModelStepProps) {
  const { input, set } = sell;
  return (
    <section aria-label={t.modell} className={`${CALC_CARD} space-y-4`}>
      <StepHead schritt={2} titel={t.modell} hinweis={t.modellHint(input.mode)} fertig />
      <div className="[&>div]:w-full [&>div>button]:flex-1">
        <ModeToggle
          options={[
            { id: "miete", label: t.modes.miete },
            { id: "kauf", label: t.modes.kauf },
          ]}
          value={input.mode}
          onChange={(mode) => set({ mode })}
        />
      </div>
      <Reveal show={input.mode === "kauf"}>
        <PaymentToggle financed={input.financed} onChange={(financed) => set({ financed })} />
      </Reveal>
      <AdvancedSettings sell={sell} />
    </section>
  );
}
