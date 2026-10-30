import type { Tariff } from "../tariff/tariffTypes";
import type { AltEingabe, NeuTarif, Sparte, Wohnform } from "./energyCalc";
import { gpMonatAusJahr, parseZahl, richtwertGas, richtwertStrom } from "./energyNumbers";

/** Eingaben einer Sparte, als Text wie getippt (v1 SparteState). */
export interface SparteState {
  modus: "genau" | "schnell";
  kwh: string;
  apAlt: string;
  gpAlt: string;
  gpProJahr: boolean;
  abschlag: string;
  personen: number;
  m2: string;
  wohnform: Wohnform;
  altVersorger: string;
  grundversorgung: boolean;
  tarifName: string;
  apNeu: string;
  gpNeu: string;
  bonus: string;
  garantie: string;
  preiseOffen: boolean;
}

export interface EnergyState {
  aktiv: Sparte;
  strom: SparteState;
  gas: SparteState;
}

export const SPARTEN = ["strom", "gas"] as const;

export const leer = (sparte: Sparte): SparteState => ({
  modus: "schnell",
  kwh: sparte === "strom" ? richtwertStrom(2, "wohnung").toLocaleString("de-DE") : "",
  apAlt: "",
  gpAlt: "",
  gpProJahr: false,
  abschlag: "",
  personen: 2,
  m2: "",
  wohnform: "wohnung",
  altVersorger: "",
  grundversorgung: false,
  tarifName: "",
  apNeu: "",
  gpNeu: "",
  bonus: "",
  garantie: "",
  preiseOffen: false,
});

export const START: EnergyState = { aktiv: "strom", strom: leer("strom"), gas: leer("gas") };

/** Text, der etwas enthält, aber keine gültige Zahl ist. */
export const ungueltig = (v: string) => v.trim() !== "" && parseZahl(v) === null;

/** Gültige Rechnung einer Sparte, oder null solange Verbrauch oder Preise fehlen. */
export function eingabe(s: SparteState): { alt: AltEingabe; neu: NeuTarif } | null {
  const kwh = parseZahl(s.kwh);
  const apNeu = parseZahl(s.apNeu);
  const gpNeu = parseZahl(s.gpNeu);
  const optional = (v: string) => (v.trim() === "" ? 0 : parseZahl(v));
  const bonus = optional(s.bonus);
  const garantie = optional(s.garantie);
  if (!kwh || apNeu === null || gpNeu === null || bonus === null || garantie === null) return null;
  const neu: NeuTarif = { apCt: apNeu, gpEuroMonat: gpNeu, bonusEuro: bonus, preisgarantieMonate: garantie };
  if (s.modus === "schnell") {
    const abschlag = parseZahl(s.abschlag);
    return abschlag ? { alt: { modus: "schnell", kwh, abschlagEuro: abschlag }, neu } : null;
  }
  const apAlt = parseZahl(s.apAlt);
  const gpAlt = parseZahl(s.gpAlt);
  if (apAlt === null || gpAlt === null) return null;
  return { alt: { modus: "genau", kwh, apCt: apAlt, gpEuroMonat: s.gpProJahr ? gpMonatAusJahr(gpAlt) : gpAlt }, neu };
}

/** Personen, Fläche oder Wohnform geändert: kWh-Richtwert neu setzen (Gas erst mit Fläche). */
export function mitRichtwert(sparte: Sparte, cur: SparteState): SparteState {
  const m2 = parseZahl(cur.m2);
  const kwh = sparte === "strom" ? richtwertStrom(cur.personen, cur.wohnform) : m2 ? richtwertGas(m2, cur.wohnform) : null;
  return kwh === null ? cur : { ...cur, kwh: kwh.toLocaleString("de-DE") };
}

const zahlText = (n: number | undefined) => (n === undefined ? "" : String(n).replace(".", ","));

/** Felder, die ein angetippter Tarif aus der Verwaltung vorbelegt. */
export const tarifFelder = (t: Tariff): Partial<SparteState> => ({
  tarifName: t.name,
  apNeu: zahlText(t.attributes?.arbeitspreisCt),
  gpNeu: zahlText(t.attributes?.grundpreisEuroMonat),
  bonus: zahlText(t.attributes?.bonusEuro),
  garantie: zahlText(t.attributes?.preisgarantieMonate),
});
