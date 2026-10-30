import type { TransferProduct } from "../tariff/pencilSellStorage";
import { energyTexts as t } from "../../texts/energyTexts";
import type { EnergyState } from "./energyState";
import type { TafelTeil } from "./energyTafel";

/** Produkte für den Verkaufsdialog (v1 abschluss): eins je gerechnete Sparte, mit Verbrauch und Ersparnis. */
export function energyProducts(state: EnergyState, teile: TafelTeil[]): TransferProduct[] {
  return teile.map(({ sparte, alt, neu, ergebnis }) => {
    const st = state[sparte];
    const name = t.sparte[sparte];
    return {
      category: name,
      type: st.tarifName || t.eigenerPreis(name),
      quantity: 1,
      details: {
        kwh: alt.kwh,
        altVersorger: st.altVersorger.trim(),
        grundversorgung: st.grundversorgung,
        schaetzung: alt.modus === "schnell",
        apNeuCt: neu.apCt,
        gpNeuMonat: neu.gpEuroMonat,
        bonusEuro: neu.bonusEuro ?? 0,
        preisgarantieMonate: neu.preisgarantieMonate ?? 0,
        ersparnisJahr1: ergebnis.ersparnisJahr1Cent / 100,
        ersparnisAbJahr2: ergebnis.ersparnisAbJahr2Cent / 100,
      },
    };
  });
}
