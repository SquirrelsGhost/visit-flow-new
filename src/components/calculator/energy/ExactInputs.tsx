import type { EnergySell } from "../../../hooks/useEnergyPencilSell";
import { energyTexts as t } from "../../../texts/energyTexts";
import EnergyField from "./EnergyField";
import { FARBE } from "./energyStyles";
import Segmented from "./Segmented";

interface ExactInputsProps {
  sell: EnergySell;
}

const GP_ART = [
  { wert: "monat" as const, label: t.gpMonat },
  { wert: "jahr" as const, label: t.gpJahr },
];

/** Genau-Modus: Werte aus der Jahresabrechnung, Grundpreis wahlweise pro Monat oder pro Jahr. */
export default function ExactInputs({ sell }: ExactInputsProps) {
  const { s, aktiv, actions } = sell;
  return (
    <>
      <EnergyField
        label={t.kwhAbrechnung}
        value={s.kwh}
        onChange={(kwh) => actions.setS({ kwh })}
        suffix="kWh"
        placeholder={t.kwhPlaceholder}
      />
      <div className="grid grid-cols-2 gap-3">
        <EnergyField label={t.arbeitspreis} value={s.apAlt} onChange={(apAlt) => actions.setS({ apAlt })} suffix="ct/kWh" placeholder="42,5" />
        <EnergyField
          label={t.grundpreis}
          value={s.gpAlt}
          onChange={(gpAlt) => actions.setS({ gpAlt })}
          suffix={s.gpProJahr ? "€/Jahr" : "€/Mon."}
          placeholder={s.gpProJahr ? "178,80" : "14,90"}
        />
      </div>
      <Segmented
        werte={GP_ART}
        wert={s.gpProJahr ? "jahr" : "monat"}
        onChange={(w) => actions.setS({ gpProJahr: w === "jahr" })}
        aktivKlasse={FARBE[aktiv].aktiv}
      />
    </>
  );
}
