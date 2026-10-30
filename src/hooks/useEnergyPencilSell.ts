import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { berechne, summe, type Sparte } from "../lib/energy/energyCalc";
import { tarifVorschau } from "../lib/energy/energyPreview";
import { mitRichtwert, eingabe, SPARTEN, START, tarifFelder, type EnergyState, type SparteState } from "../lib/energy/energyState";
import { clearEnergyState, loadEnergyState, saveEnergyState } from "../lib/energy/energyStorage";
import type { TafelTeil } from "../lib/energy/energyTafel";
import type { Tariff } from "../lib/tariff/tariffTypes";
import { energyTexts as tx } from "../texts/energyTexts";
import { useTariffList } from "./useTariffs";

type Basis = Partial<Pick<SparteState, "personen" | "m2" | "wohnform">>;

/** Zustand des Strom- und Gas-Vergleichs (v1 EnergyPencilSell): Eingaben, Tarife, Rechnung, Vorschau je Tarif. */
export function useEnergyPencilSell() {
  const [state, setState] = useState(loadEnergyState);
  const strom = useTariffList("strom");
  const gas = useTariffList("gas");

  useEffect(() => saveEnergyState(state), [state]);

  const aktiv = state.aktiv;
  const geladen = aktiv === "strom" ? strom : gas;
  const tarife = useMemo(
    () => geladen.tariffs.filter((t) => t.attributes?.arbeitspreisCt !== undefined),
    [geladen.tariffs],
  );

  const setAktiv = useCallback((sparte: Sparte) => setState((prev) => ({ ...prev, aktiv: sparte })), []);
  const setS = useCallback(
    (patch: Partial<SparteState>) => setState((prev) => ({ ...prev, [prev.aktiv]: { ...prev[prev.aktiv], ...patch } })),
    [],
  );
  const setBasis = useCallback(
    (patch: Basis) =>
      setState((prev) => ({ ...prev, [prev.aktiv]: mitRichtwert(prev.aktiv, { ...prev[prev.aktiv], ...patch }) })),
    [],
  );
  const tarifWaehlen = useCallback((t: Tariff) => setS(tarifFelder(t)), [setS]);
  const wiederherstellen = useCallback((prev: EnergyState) => setState(prev), []);
  /** Alles leeren, mit "Rückgängig" im Hinweis, falls an der Tür versehentlich getippt. */
  const neuStarten = useCallback(() => {
    const prev = state;
    clearEnergyState();
    setState(START);
    toast(tx.zurueckgesetzt, { action: { label: tx.rueckgaengig, onClick: () => wiederherstellen(prev) } });
  }, [state, wiederherstellen]);

  const teile: TafelTeil[] = useMemo(
    () =>
      SPARTEN.flatMap((sparte) => {
        const e = eingabe(state[sparte]);
        if (!e) return [];
        const { grundversorgung, tarifName } = state[sparte];
        return [{ sparte, ...e, ergebnis: berechne(e.alt, e.neu), grundversorgung, tarifName }];
      }),
    [state],
  );
  const [teil1, teil2] = teile;
  const gesamt = teil1 && teil2 ? summe(teil1.ergebnis, teil2.ergebnis) : teil1?.ergebnis;
  const vorschau = useMemo(() => tarifVorschau(state[aktiv], tarife), [state, aktiv, tarife]);
  const keineTarife = !geladen.loading && tarife.length === 0;

  return {
    state,
    s: state[aktiv],
    aktiv,
    tarife,
    keineTarife,
    teile,
    gesamt,
    vorschau,
    gefuellt: (sparte: Sparte) => teile.some((t) => t.sparte === sparte),
    actions: { setAktiv, setS, setBasis, tarifWaehlen, neuStarten },
  };
}

export type EnergySell = ReturnType<typeof useEnergyPencilSell>;
