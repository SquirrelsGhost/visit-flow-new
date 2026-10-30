import { useEffect, useMemo, useState } from "react";
import { loadTelcoState, saveSavings, saveTelcoState } from "../lib/tariff/pencilSellStorage";
import { oneTimeCosts } from "../lib/tariff/tariffConvert";
import { buildMeta, internetTariffs, portfolioToCategory } from "../lib/tariff/telcoMeta";
import { buildFamilyCards, buildMobilePlans, gigaKombiDiscount } from "../lib/tariff/telcoMobile";
import { currentTariff, downgradeOptions } from "../lib/tariff/telcoNeu";
import { buildGigaTvOptions, buildRouterOptions } from "../lib/tariff/telcoOptions";
import { computeQuote } from "../lib/tariff/telcoQuote";
import { hasTariff, type TelcoState } from "../lib/tariff/telcoTypes";
import { useSecretTaps } from "./useSecretTaps";
import { useTariffs } from "./useTariffs";
import { useTelcoActions } from "./useTelcoActions";

const SAVE_DELAY = 400;

/**
 * Herz des Telco-Tarifvergleichs (v1 TelcoPencilSell): Zustand, Tarife aus der Verwaltung,
 * die Rechnung und das Speichern. Nur im Browser verwenden (liest localStorage beim Start).
 */
export function useTelcoPencilSell() {
  const [state, setState] = useState<TelcoState>(loadTelcoState);
  const internet = useTariffs(portfolioToCategory(state.portfolio));
  const mobile = useTariffs("mobil");
  const tv = useTariffs("tv");
  const bestand = useTariffs("kabel-bestand");
  const routers = useTariffs("router");

  const loaded = useMemo(() => internetTariffs(state.portfolio, internet), [state.portfolio, internet]);
  const costs = useMemo(() => oneTimeCosts(internet), [internet]);
  const meta = useMemo(() => buildMeta(state.portfolio, loaded, costs.setup), [state.portfolio, loaded, costs.setup]);
  const gigaOptions = useMemo(() => buildGigaTvOptions(state.isTvBestand, state.isTvBestand ? bestand : tv), [state.isTvBestand, bestand, tv]);
  const routerOptions = useMemo(() => buildRouterOptions(state.portfolio, routers), [state.portfolio, routers]);
  const mobilePlans = useMemo(() => buildMobilePlans(mobile), [mobile]);
  const familyCards = useMemo(() => buildFamilyCards(mobile), [mobile]);

  const quote = useMemo(
    () =>
      computeQuote(state, meta, {
        gigaOptions,
        routerOptions,
        mobilePlans,
        familyCards,
        gigaKombiDiscount: gigaKombiDiscount(mobile, state.mobileId),
        shipping: costs.shipping,
      }),
    [state, meta, gigaOptions, routerOptions, mobilePlans, familyCards, mobile, costs.shipping],
  );

  useEffect(() => {
    const timer = setTimeout(() => saveTelcoState(state), SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (hasTariff(state)) saveSavings(quote.ersparnis, quote.neuAvg, state.portfolio);
  }, [quote.ersparnis, quote.neuAvg, state]);

  const actions = useTelcoActions(setState, mobilePlans);
  const secret = useSecretTaps(state, setState);

  return {
    state,
    meta,
    loaded,
    quote,
    gigaOptions,
    routerOptions,
    mobilePlans,
    familyCards,
    shipping: costs.shipping,
    current: currentTariff(state, meta),
    downgrades: downgradeOptions(state, meta),
    actions,
    secret,
  };
}

export type TelcoPencilSell = ReturnType<typeof useTelcoPencilSell>;
