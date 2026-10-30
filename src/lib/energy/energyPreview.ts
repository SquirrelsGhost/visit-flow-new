import type { Tariff } from "../tariff/tariffTypes";
import { berechne } from "./energyCalc";
import { gpMonatAusJahr, parseZahl } from "./energyNumbers";
import { eingabe, tarifFelder, type SparteState } from "./energyState";

/** Was einer Sparte noch fehlt, bis sie gerechnet werden kann. */
export type Schritt = "verbrauch" | "heute" | "tarif";

const zahl = (v: string) => parseZahl(v);

/** Heutige Kosten pro Jahr in Cent, sobald Abschlag bzw. Preise aus der Abrechnung da sind. */
export function heuteJahrCent(s: SparteState): number | null {
  if (s.modus === "schnell") {
    const abschlag = zahl(s.abschlag);
    return abschlag ? Math.round(abschlag * 1200) : null;
  }
  const kwh = zahl(s.kwh);
  const ap = zahl(s.apAlt);
  const gp = zahl(s.gpAlt);
  if (!kwh || ap === null || gp === null) return null;
  return Math.round(kwh * ap) + Math.round((s.gpProJahr ? gpMonatAusJahr(gp) : gp) * 1200);
}

/** Kosten des neuen Tarifs pro Jahr in Cent (ohne Bonus), sobald Verbrauch und Preise da sind. */
export function neuJahrCent(s: SparteState): number | null {
  const kwh = zahl(s.kwh);
  const ap = zahl(s.apNeu);
  const gp = zahl(s.gpNeu);
  if (!kwh || ap === null || gp === null) return null;
  return Math.round(kwh * ap) + Math.round(gp * 1200);
}

/** Offene Schritte in der Reihenfolge, in der man sie an der Tür ausfüllt. */
export function offeneSchritte(s: SparteState): Schritt[] {
  const offen: Schritt[] = [];
  if (!zahl(s.kwh)) offen.push("verbrauch");
  const heuteFehlt = s.modus === "schnell" ? !zahl(s.abschlag) : zahl(s.apAlt) === null || zahl(s.gpAlt) === null;
  if (heuteFehlt) offen.push("heute");
  if (zahl(s.apNeu) === null || zahl(s.gpNeu) === null) offen.push("tarif");
  return offen;
}

export interface TarifVorschau {
  /** Ersparnis im 1. Jahr in Cent, null solange heute oder Verbrauch fehlt */
  ersparnisCent: number | null;
  bester: boolean;
}

/** Ersparnis je Tarif aus der Verwaltung mit den aktuellen Eingaben; der günstigste mit Vorteil ist "bester". */
export function tarifVorschau(s: SparteState, tarife: Tariff[]): Record<string, TarifVorschau> {
  const werte = tarife.map((t) => {
    const e = eingabe({ ...s, ...tarifFelder(t) });
    return { id: t.id, cent: e ? berechne(e.alt, e.neu).ersparnisJahr1Cent : null };
  });
  const maxCent = Math.max(...werte.map((w) => w.cent ?? -Infinity));
  const mitVorteil = werte.filter((w) => w.cent !== null && w.cent > 0).length;
  return Object.fromEntries(
    werte.map((w) => [w.id, { ersparnisCent: w.cent, bester: mitVorteil > 1 && w.cent === maxCent && maxCent > 0 }]),
  );
}
