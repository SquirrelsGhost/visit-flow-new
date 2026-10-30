import { describe, expect, it } from "vitest";
import { heuteJahrCent, neuJahrCent, offeneSchritte, tarifVorschau } from "../lib/energy/energyPreview";
import { leer } from "../lib/energy/energyState";
import type { Tariff } from "../lib/tariff/tariffTypes";

const tarif = (id: string, arbeitspreisCt: number, grundpreisEuroMonat: number, bonusEuro = 0) =>
  ({ id, name: id, attributes: { arbeitspreisCt, grundpreisEuroMonat, bonusEuro } }) as unknown as Tariff;

describe("Vorschau Strom und Gas", () => {
  it("zeigt heutige und neue Jahreskosten, sobald sie sich rechnen lassen", () => {
    const s = leer("strom");
    expect(heuteJahrCent(s)).toBeNull();
    expect(heuteJahrCent({ ...s, abschlag: "120" })).toBe(144000);
    expect(heuteJahrCent({ ...s, modus: "genau", kwh: "3.500", apAlt: "40", gpAlt: "120", gpProJahr: true })).toBe(152000);
    expect(neuJahrCent({ ...s, apNeu: "27,5", gpNeu: "14,90" })).toBe(86630);
  });

  it("listet nur, was noch fehlt", () => {
    const s = leer("strom");
    expect(offeneSchritte(s)).toEqual(["heute", "tarif"]);
    expect(offeneSchritte(leer("gas"))).toEqual(["verbrauch", "heute", "tarif"]);
    expect(offeneSchritte({ ...s, abschlag: "120", apNeu: "27,5", gpNeu: "14,90" })).toEqual([]);
  });

  it("rechnet die Ersparnis je Tarif und markiert den besten", () => {
    const s = { ...leer("strom"), abschlag: "120" };
    const v = tarifVorschau(s, [tarif("a", 30, 15), tarif("b", 27.5, 14.9, 100), tarif("c", 60, 20)]);
    expect(v.b?.ersparnisCent).toBe(67370);
    expect(v.b?.bester).toBe(true);
    expect(v.a?.bester).toBe(false);
    expect(v.c?.ersparnisCent).toBeLessThan(0);
    expect(tarifVorschau(leer("strom"), [tarif("a", 30, 15)]).a?.ersparnisCent).toBeNull();
  });
});
