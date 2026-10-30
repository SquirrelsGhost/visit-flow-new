import type { EnergySell } from "../../../hooks/useEnergyPencilSell";
import { neuJahrCent, offeneSchritte } from "../../../lib/energy/energyPreview";
import { energyTexts as t } from "../../../texts/energyTexts";
import Reveal from "../../ui/Reveal";
import EnergyField from "./EnergyField";
import { FARBE, PANEL } from "./energyStyles";
import PanelHead from "./PanelHead";
import TariffChip from "./TariffChip";

interface NewTariffPanelProps {
  sell: EnergySell;
}

/** Schritt 2 "Neuer Tarif": Tarif aus der Verwaltung antippen (mit Ersparnis je Tarif) oder Preise selbst eintragen. */
export default function NewTariffPanel({ sell }: NewTariffPanelProps) {
  const { s, aktiv, tarife, keineTarife, vorschau, actions } = sell;
  const farbe = FARBE[aktiv];
  const name = t.sparte[aktiv];
  const fertig = !offeneSchritte(s).includes("tarif");
  return (
    <section className={PANEL} aria-label={t.newTariff}>
      <PanelHead
        schritt={2}
        titel={t.newTariff}
        hinweis={t.newTariffHint}
        jahrCent={fertig ? neuJahrCent(s) : null}
        fertig={fertig}
        aktivKlasse={farbe.aktiv}
      />
      {tarife.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {tarife.map((tarif) => (
            <TariffChip
              key={tarif.id}
              tarif={tarif}
              vorschau={vorschau[tarif.id]}
              gewaehlt={s.tarifName === tarif.name}
              chipKlasse={farbe.chip}
              hakenKlasse={farbe.aktiv}
              onClick={() => actions.tarifWaehlen(tarif)}
            />
          ))}
        </div>
      )}
      {keineTarife && <p className="text-[12px] leading-relaxed text-muted-foreground">{t.keineTarife(name)}</p>}
      {!keineTarife && (
        <button
          type="button"
          aria-expanded={s.preiseOffen}
          onClick={() => actions.setS({ preiseOffen: !s.preiseOffen })}
          className={`text-xs font-semibold ${farbe.text}`}
        >
          {s.preiseOffen ? t.preiseAus : t.preiseAn}
        </button>
      )}
      <Reveal show={s.preiseOffen || keineTarife}>
        <div className="grid grid-cols-2 gap-3">
          <EnergyField label={t.arbeitspreis} value={s.apNeu} onChange={(apNeu) => actions.setS({ apNeu })} suffix="ct/kWh" placeholder="29,9" />
          <EnergyField label={t.grundpreis} value={s.gpNeu} onChange={(gpNeu) => actions.setS({ gpNeu })} suffix="€/Mon." placeholder="12,50" />
          <EnergyField label={t.bonus} value={s.bonus} onChange={(bonus) => actions.setS({ bonus })} suffix="€" placeholder="0" />
          <EnergyField label={t.garantie} value={s.garantie} onChange={(garantie) => actions.setS({ garantie })} suffix="Mon." placeholder="0" />
        </div>
      </Reveal>
    </section>
  );
}
