import type { Wohnform } from "./energyCalc";

/**
 * Deutsche Zahleneingabe. Komma = Dezimal. Nur Punkte in Dreiergruppen = Tausender
 * ("3.500" → 3500), sonst ist der Punkt das Dezimalzeichen ("29.9"). null bei leer, Text oder negativ.
 */
export function parseZahl(raw: string): number | null {
  const s = (raw || "").replace(/\s/g, "");
  if (!/^\d[\d.,]*$/.test(s)) return null;
  const tausender = /^\d{1,3}(\.\d{3})+$/;
  let norm: string;
  if (s.includes(",")) {
    const teile = s.split(",");
    if (teile.length > 2) return null;
    const [ganz = "", dezimal = ""] = teile;
    if (ganz.includes(".") && !tausender.test(ganz)) return null;
    norm = `${ganz.replace(/\./g, "")}.${dezimal}`;
  } else if (tausender.test(s)) {
    norm = s.replace(/\./g, "");
  } else {
    if (s.split(".").length > 2) return null;
    norm = s;
  }
  const n = Number(norm);
  return Number.isFinite(n) ? n : null;
}

export const gpMonatAusJahr = (euroJahr: number): number => euroJahr / 12;

/** Stromspiegel Deutschland (co2online, Stand 13.05.2025), obere Werte mit elektrischem Warmwasser. */
const STROM_RICHTWERT: Record<Wohnform, number[]> = {
  wohnung: [1600, 2500, 3500, 4000, 5000],
  haus: [2100, 3200, 4100, 4700, 6000],
};

/** Heizspiegel 2025 (co2online), Erdgas im Durchschnitt, kWh pro m² und Jahr. */
const GAS_KWH_PRO_M2: Record<Wohnform, number> = { wohnung: 114, haus: 121 };

export function richtwertStrom(personen: number, wohnform: Wohnform): number {
  const i = Math.min(5, Math.max(1, Math.round(personen) || 1)) - 1;
  return STROM_RICHTWERT[wohnform][i] ?? 0;
}

export function richtwertGas(m2: number, wohnform: Wohnform): number {
  return Math.max(0, Math.round(m2 * GAS_KWH_PRO_M2[wohnform]));
}

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const ZAHL = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
const EURO_ZAHL = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatEuro = (cent: number): string => EURO.format(cent / 100);
export const formatKwh = (kwh: number): string => `${ZAHL.format(Math.round(kwh))} kWh`;
export const formatCt = (ct: number): string => `${ZAHL.format(ct)} ct`;

/** Tarifzeile: "29,9 ct/kWh · 12,50 €/Monat" */
export const formatEnergiePreis = (apCt: number, gpEuroMonat: number): string =>
  `${ZAHL.format(apCt)} ct/kWh · ${EURO_ZAHL.format(gpEuroMonat)} €/Monat`;
