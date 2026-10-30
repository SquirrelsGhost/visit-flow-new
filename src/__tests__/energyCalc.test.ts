import { describe, expect, it } from "vitest";
import { berechne, summe } from "../lib/energy/energyCalc";
import { parseZahl } from "../lib/energy/energyNumbers";
import { eingabe, leer } from "../lib/energy/energyState";

describe("Strom und Gas", () => {
  it("rechnet Abschlag gegen neuen Tarif mit Bonus", () => {
    const strom = berechne({ modus: "schnell", kwh: 2500, abschlagEuro: 120 }, { apCt: 27.5, gpEuroMonat: 14.9, bonusEuro: 100, preisgarantieMonate: 24 });
    expect(strom.altJahrCent).toBe(144000);
    expect(strom.neuJahrCent).toBe(86630);
    expect(strom.ersparnisJahr1Cent).toBe(67370);
    const gas = berechne({ modus: "schnell", kwh: 10260, abschlagEuro: 110 }, { apCt: 8.9, gpEuroMonat: 15.5, bonusEuro: 80 });
    expect(summe(strom, gas).ersparnisJahr1Cent).toBe(97456);
  });

  it("liest deutsche Zahlen", () => {
    expect(parseZahl("3.500")).toBe(3500);
    expect(parseZahl("29,9")).toBe(29.9);
    expect(parseZahl("29.9")).toBe(29.9);
    expect(parseZahl("abc")).toBeNull();
  });

  it("rechnet erst, wenn Verbrauch, Abschlag und Preise da sind", () => {
    expect(eingabe(leer("strom"))).toBeNull();
    expect(eingabe({ ...leer("strom"), abschlag: "120", apNeu: "27,5", gpNeu: "14,90" })?.alt.kwh).toBe(2500);
  });
});
