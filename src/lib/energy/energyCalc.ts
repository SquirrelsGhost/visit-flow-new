/**
 * Pencil Sell Strom & Gas, reine Rechnung ohne React (1:1 aus v1 energyCalc).
 * Gerechnet wird in Cent, damit Rundungen nicht wandern.
 */
export type Sparte = "strom" | "gas";
export type Wohnform = "wohnung" | "haus";

/** Was der Kunde heute zahlt: genau (Jahresabrechnung) oder geschätzt (Abschlag). */
export type AltEingabe =
  | { modus: "genau"; kwh: number; apCt: number; gpEuroMonat: number }
  | { modus: "schnell"; kwh: number; abschlagEuro: number };

/** Der neue Tarif, Preise brutto. */
export interface NeuTarif {
  apCt: number;
  gpEuroMonat: number;
  bonusEuro?: number;
  preisgarantieMonate?: number;
}

export interface Ergebnis {
  kwh: number;
  geschaetzt: boolean;
  /** null im Schnell-Modus: dort kennen wir nur den Abschlag */
  altEnergieCent: number | null;
  altGrundCent: number | null;
  altJahrCent: number;
  neuEnergieCent: number;
  neuGrundCent: number;
  neuJahrCent: number;
  bonusCent: number;
  neuJahr1Cent: number;
  ersparnisJahr1Cent: number;
  ersparnisAbJahr2Cent: number;
  /** null ohne hinterlegte Preisgarantie */
  ersparnisGarantieCent: number | null;
  preisgarantieMonate: number | null;
  monateGeschenkt: number;
  neuMonatCent: number;
}

const monateGeschenkt = (ersparnisJahr1Cent: number, neuJahrCent: number): number => {
  if (neuJahrCent <= 0) return 0;
  const monate = Math.floor(ersparnisJahr1Cent / (neuJahrCent / 12));
  return monate >= 1 ? monate : 0;
};

export function berechne(alt: AltEingabe, neu: NeuTarif): Ergebnis {
  const altEnergieCent = alt.modus === "genau" ? Math.round(alt.kwh * alt.apCt) : null;
  const altGrundCent = alt.modus === "genau" ? Math.round(alt.gpEuroMonat * 1200) : null;
  const altJahrCent = alt.modus === "genau" ? (altEnergieCent ?? 0) + (altGrundCent ?? 0) : Math.round(alt.abschlagEuro * 1200);
  const neuEnergieCent = Math.round(alt.kwh * neu.apCt);
  const neuGrundCent = Math.round(neu.gpEuroMonat * 1200);
  const neuJahrCent = neuEnergieCent + neuGrundCent;
  const bonusCent = Math.round((neu.bonusEuro || 0) * 100);
  const neuJahr1Cent = neuJahrCent - bonusCent;
  const ersparnisJahr1Cent = altJahrCent - neuJahr1Cent;
  const ersparnisAbJahr2Cent = altJahrCent - neuJahrCent;
  const garantie = neu.preisgarantieMonate && neu.preisgarantieMonate > 0 ? neu.preisgarantieMonate : null;
  return {
    kwh: alt.kwh,
    geschaetzt: alt.modus === "schnell",
    altEnergieCent,
    altGrundCent,
    altJahrCent,
    neuEnergieCent,
    neuGrundCent,
    neuJahrCent,
    bonusCent,
    neuJahr1Cent,
    ersparnisJahr1Cent,
    ersparnisAbJahr2Cent,
    ersparnisGarantieCent: garantie === null ? null : Math.round((ersparnisAbJahr2Cent * garantie) / 12) + bonusCent,
    preisgarantieMonate: garantie,
    monateGeschenkt: monateGeschenkt(ersparnisJahr1Cent, neuJahrCent),
    neuMonatCent: Math.round(neuJahrCent / 12),
  };
}

/** Kombi Strom + Gas: Beträge addieren, Kennzahlen neu bilden. */
export function summe(a: Ergebnis, b: Ergebnis): Ergebnis {
  const add = (x: number | null, y: number | null) => (x === null || y === null ? null : x + y);
  const neuJahrCent = a.neuJahrCent + b.neuJahrCent;
  const ersparnisJahr1Cent = a.ersparnisJahr1Cent + b.ersparnisJahr1Cent;
  return {
    kwh: a.kwh + b.kwh,
    geschaetzt: a.geschaetzt || b.geschaetzt,
    altEnergieCent: add(a.altEnergieCent, b.altEnergieCent),
    altGrundCent: add(a.altGrundCent, b.altGrundCent),
    altJahrCent: a.altJahrCent + b.altJahrCent,
    neuEnergieCent: a.neuEnergieCent + b.neuEnergieCent,
    neuGrundCent: a.neuGrundCent + b.neuGrundCent,
    neuJahrCent,
    bonusCent: a.bonusCent + b.bonusCent,
    neuJahr1Cent: a.neuJahr1Cent + b.neuJahr1Cent,
    ersparnisJahr1Cent,
    ersparnisAbJahr2Cent: a.ersparnisAbJahr2Cent + b.ersparnisAbJahr2Cent,
    ersparnisGarantieCent: add(a.ersparnisGarantieCent, b.ersparnisGarantieCent),
    preisgarantieMonate: a.preisgarantieMonate === b.preisgarantieMonate ? a.preisgarantieMonate : null,
    monateGeschenkt: monateGeschenkt(ersparnisJahr1Cent, neuJahrCent),
    neuMonatCent: Math.round(neuJahrCent / 12),
  };
}
