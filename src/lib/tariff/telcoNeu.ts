import { UPSELL_LOYALTY_TARIFFS, UPSELL_WINBACK_TARIFFS } from "./telcoCatalog";
import type { MetaTariff, TelcoMeta, TelcoState } from "./telcoTypes";

export interface NeuPrices {
  a6: number;
  a79: number;
  b: number;
  credit: number;
  creditMax: number;
  oneOffs: number;
}

/** Erste Zahl im Namen als Geschwindigkeit ("Giga Zuhause 1000" → 1000). */
export function extractSpeed(name?: string): number {
  const match = String(name || "").match(/(\d+)/);
  return match?.[1] ? parseInt(match[1], 10) : NaN;
}

const isUpsellLoyalty = (s: TelcoState) => s.portfolio === "kabel-upsell" && !!s.tariffId?.startsWith("lu");
const isUpsellWinback = (s: TelcoState) => s.portfolio === "kabel-upsell" && !!s.tariffId?.startsWith("wb");

/** Der Upsell-Treuetarif rechnet 24 Monate flat (v1). */
export const upsellLoyaltyFlat = (s: TelcoState) => s.upsellLoyaltyUnlocked && isUpsellLoyalty(s);

/** Gewählter Internet-Tarif, auch aus den geheimen Upsell-Listen. */
export function currentTariff(s: TelcoState, meta: TelcoMeta): { id: string; name: string } | undefined {
  if (isUpsellWinback(s)) return UPSELL_WINBACK_TARIFFS.find((x) => x.id === s.tariffId);
  if (isUpsellLoyalty(s)) return UPSELL_LOYALTY_TARIFFS.find((x) => x.id === s.tariffId);
  return meta.tariffs.find((x) => x.id === s.tariffId);
}

const canDowngrade = (s: TelcoState) => s.portfolio === "kabel-neu" || s.portfolio === "glasfaser";
export { canDowngrade };

/** Preise des neuen Tarifs (v1 neu), inkl. Wechsel ab 10. Monat und Startguthaben-Regel. */
export function resolveNeu(s: TelcoState, meta: TelcoMeta): NeuPrices {
  const flat = (list: typeof UPSELL_WINBACK_TARIFFS): NeuPrices => ({
    a6: list.find((x) => x.id === s.tariffId)?.monthly ?? 0,
    ...{ a79: 0, b: 0, credit: 0, creditMax: 0, oneOffs: 0 },
  });
  if (s.upsellWinbackUnlocked && isUpsellWinback(s)) return flat(UPSELL_WINBACK_TARIFFS);
  if (s.upsellLoyaltyUnlocked && isUpsellLoyalty(s)) return flat(UPSELL_LOYALTY_TARIFFS);

  const t = meta.tariffs.find((x) => x.id === s.tariffId);
  const down = canDowngrade(s) && s.downgradeId !== "none" ? meta.tariffs.find((x) => x.id === s.downgradeId) : undefined;
  let creditMax = t?.credit ?? 0;
  if (s.portfolio === "kabel-neu" && t) {
    if (t.id === "kmax" || t.id === "k50") creditMax = 0;
    else if (t.id === "k100" || t.id === "k250") creditMax = 50;
    else if (t.id === "k500" || t.id === "k1000") creditMax = 80;
  }
  return {
    a6: t?.a6 ?? 0,
    a79: t?.a79 ?? 0,
    b: down?.b ?? t?.b ?? 0,
    credit: Math.min(t?.credit ?? 0, creditMax),
    creditMax,
    oneOffs: s.tariffId && s.tariffId !== "none" ? meta.oneOffs : 0,
  };
}

/** Wechsel ab 10. Monat: nur langsamere Tarife über 50 Mbit/s, schnellste zuerst. */
export function downgradeOptions(s: TelcoState, meta: TelcoMeta): MetaTariff[] {
  if (!canDowngrade(s) || !s.tariffId) return [];
  const cs = extractSpeed(currentTariff(s, meta)?.name);
  return meta.tariffs
    .filter((t) => t.id !== s.tariffId)
    .filter((t) => {
      const speed = extractSpeed(t.name);
      if (speed <= 50) return false;
      if (Number.isFinite(cs) && Number.isFinite(speed)) return speed < cs;
      return !Number.isFinite(cs) && Number.isFinite(speed);
    })
    .sort((a, b) => extractSpeed(b.name) - extractSpeed(a.name));
}

/** Angerechnete Gutschrift: eigener Betrag oder Startguthaben, begrenzt auf 0 bis Maximum. */
export function appliedCredit(s: TelcoState, neu: NeuPrices): number {
  if (!s.applyCredit || neu.creditMax <= 0) return 0;
  const raw = s.creditOverride.trim();
  const override = raw === "" ? undefined : Number(raw);
  const intended = override !== undefined && Number.isFinite(override) ? override : neu.credit;
  return Math.min(Math.max(intended, 0), neu.creditMax);
}
