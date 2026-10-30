import type { EnergySell } from "../../../hooks/useEnergyPencilSell";
import { energyTexts as t } from "../../../texts/energyTexts";
import EnergyField from "./EnergyField";
import { FARBE } from "./energyStyles";
import { CALC_FIELD_LABEL } from "../calcGlass";
import Segmented from "./Segmented";

interface QuickInputsProps {
  sell: EnergySell;
}

const PERSONEN = [1, 2, 3, 4, 5].map((p) => ({ wert: p, label: p === 5 ? "5+" : String(p) }));
const WOHNFORM = [
  { wert: "wohnung" as const, label: t.wohnform.wohnung },
  { wert: "haus" as const, label: t.wohnform.haus },
];

/** Schnell-Modus: Abschlag plus Haushalt, daraus ein anpassbarer Verbrauchs-Richtwert. */
export default function QuickInputs({ sell }: QuickInputsProps) {
  const { s, aktiv, actions } = sell;
  const farbe = FARBE[aktiv].aktiv;
  return (
    <>
      <EnergyField
        label={t.abschlag}
        value={s.abschlag}
        onChange={(abschlag) => actions.setS({ abschlag })}
        suffix="€"
        placeholder={t.abschlagPlaceholder}
      />
      {aktiv === "strom" ? (
        <div className="space-y-1.5">
          <span className={CALC_FIELD_LABEL}>{t.personen}</span>
          <Segmented
            label={t.personen}
            werte={PERSONEN}
            wert={s.personen}
            onChange={(personen) => actions.setBasis({ personen })}
            aktivKlasse={farbe}
          />
        </div>
      ) : (
        <EnergyField label={t.m2} value={s.m2} onChange={(m2) => actions.setBasis({ m2 })} suffix="m²" placeholder={t.m2Placeholder} />
      )}
      <Segmented werte={WOHNFORM} wert={s.wohnform} onChange={(wohnform) => actions.setBasis({ wohnform })} aktivKlasse={farbe} />
      <EnergyField label={t.kwhRichtwert} value={s.kwh} onChange={(kwh) => actions.setS({ kwh })} suffix="kWh" />
      <p className="text-[11px] text-muted-foreground">{t.geschaetztHinweis}</p>
    </>
  );
}
