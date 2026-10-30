import type { PencilSellTariff } from "./tariffTypes";
import type { MetaTariff, Portfolio } from "./telcoTypes";
import { isCable } from "./telcoTypes";

const bandwidthOf = (loaded: PencilSellTariff[], id: string) => {
  const bw = loaded.find((t) => t.id === id)?.bandwidth;
  return bw ? ` (${bw} Mbit/s)` : "";
};

/** Name in der Tarifliste (v1): "Giga Zuhause 250 (250 Mbit/s)", "Glasfaser 500 (500 Mbit/s)". */
export function tariffOptionLabel(portfolio: Portfolio, t: MetaTariff, loaded: PencilSellTariff[]): string {
  const bw = bandwidthOf(loaded, t.id);
  const lower = t.name.toLowerCase();
  if (isCable(portfolio)) return lower.includes("zuhause") ? `${t.name}${bw}` : `Giga Zuhause ${t.name}${bw}`;
  if (portfolio === "glasfaser") return lower.includes("glasfaser") ? `${t.name}${bw}` : `Glasfaser ${t.name}${bw}`;
  return `${t.name}${bw}`;
}

/** Name im "Wechsel ab 10. Monat" (v1 ohne Zuhause-Prüfung). */
export function downgradeOptionLabel(portfolio: Portfolio, t: MetaTariff, loaded: PencilSellTariff[]): string {
  const bw = bandwidthOf(loaded, t.id);
  if (portfolio === "kabel-neu") return `Giga Zuhause ${t.name}${bw}`;
  if (portfolio === "glasfaser") return `Glasfaser ${t.name}${bw}`;
  return t.name;
}

export const withBandwidth = bandwidthOf;

const isSecret = (t: MetaTariff) => {
  const name = t.name.toLowerCase();
  return /^(lu|lt_|wb)/.test(t.id) || name.includes("treue") || name.includes("winback");
};

/** Normale Tarifliste: ohne Treue/Winback, CableMax zuerst, dann schnellste zuerst. */
export function sortedTariffs(tariffs: MetaTariff[], loaded: PencilSellTariff[]): MetaTariff[] {
  const bw = (id: string) => loaded.find((t) => t.id === id)?.bandwidth ?? 0;
  const isMax = (t: MetaTariff) => t.name === "CableMax" || t.id === "kmax";
  return tariffs
    .filter((t) => !isSecret(t))
    .sort((a, b) => (isMax(a) !== isMax(b) ? (isMax(a) ? -1 : 1) : bw(b.id) - bw(a.id)));
}
