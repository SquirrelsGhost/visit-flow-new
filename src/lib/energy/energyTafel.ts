import { energyTafelTexts as t } from "../../texts/energyTexts";
import { summe, type AltEingabe, type Ergebnis, type NeuTarif, type Sparte } from "./energyCalc";
import { formatCt, formatEuro, formatKwh } from "./energyNumbers";

/** Eine gerechnete Sparte, wie sie auf die Tafel kommt (v1 TafelTeil). */
export interface TafelTeil {
  sparte: Sparte;
  alt: AltEingabe;
  neu: NeuTarif;
  ergebnis: Ergebnis;
  grundversorgung: boolean;
  tarifName: string;
}

export interface TafelZeile {
  label: string;
  heute?: string;
  neu?: string;
  heuteHinweis?: string;
  summe?: boolean;
}

export type TafelArt = Sparte | "zusammen";

export interface Tafel {
  titel: string;
  art: TafelArt;
  zeilen: TafelZeile[];
  ergebnis: Ergebnis;
  hinweise: string[];
}

const bonusZeile = (e: Ergebnis): TafelZeile[] =>
  e.bonusCent > 0 ? [{ label: t.zeilen.bonus, neu: `−${formatEuro(e.bonusCent)}` }] : [];

export function tafelFuer(teil: TafelTeil): Tafel {
  const e = teil.ergebnis;
  const alt = teil.alt;
  const zeilen: TafelZeile[] = [
    { label: t.zeilen.verbrauch, heute: formatKwh(e.kwh), neu: formatKwh(e.kwh) },
    { label: t.zeilen.arbeitspreis, heute: alt.modus === "genau" ? formatCt(alt.apCt) : "–", neu: formatCt(teil.neu.apCt) },
    { label: t.zeilen.energie, heute: e.altEnergieCent !== null ? formatEuro(e.altEnergieCent) : "–", neu: formatEuro(e.neuEnergieCent) },
    { label: t.zeilen.grundpreis, heute: e.altGrundCent !== null ? formatEuro(e.altGrundCent) : "–", neu: formatEuro(e.neuGrundCent) },
    {
      label: t.zeilen.jahr,
      heute: formatEuro(e.altJahrCent),
      neu: formatEuro(e.neuJahrCent),
      ...(alt.modus === "schnell" && { heuteHinweis: t.zeilen.abschlag(formatEuro(Math.round(alt.abschlagEuro * 100))) }),
      summe: true,
    },
    ...bonusZeile(e),
  ];
  const hinweise: string[] = [];
  if (e.geschaetzt) hinweise.push(t.geschaetzt);
  if (teil.grundversorgung) hinweise.push(t.grundversorgung);
  const titel = teil.tarifName || (teil.sparte === "strom" ? "Strom" : "Gas");
  return { titel, art: teil.sparte, zeilen, ergebnis: e, hinweise };
}

export function zusammen(strom: TafelTeil, gas: TafelTeil): Tafel {
  const e = summe(strom.ergebnis, gas.ergebnis);
  const zeilen: TafelZeile[] = [
    { label: t.zeilen.stromJahr, heute: formatEuro(strom.ergebnis.altJahrCent), neu: formatEuro(strom.ergebnis.neuJahrCent) },
    { label: t.zeilen.gasJahr, heute: formatEuro(gas.ergebnis.altJahrCent), neu: formatEuro(gas.ergebnis.neuJahrCent) },
    { label: t.zeilen.zusammen, heute: formatEuro(e.altJahrCent), neu: formatEuro(e.neuJahrCent), summe: true },
    ...bonusZeile(e),
  ];
  return { titel: t.zusammenTitel, art: "zusammen", zeilen, ergebnis: e, hinweise: e.geschaetzt ? [t.geschaetzt] : [] };
}

/** Eine Tafel je Sparte, bei Strom und Gas zum Schluss die gemeinsame. */
export function tafelnFuer(teile: TafelTeil[]): Tafel[] {
  const strom = teile.find((x) => x.sparte === "strom");
  const gas = teile.find((x) => x.sparte === "gas");
  return [...teile.map(tafelFuer), ...(strom && gas ? [zusammen(strom, gas)] : [])];
}
