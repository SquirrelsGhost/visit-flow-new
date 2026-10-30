import type { FestnetzOption, RouterOption, SimpleTariff } from "./telcoTypes";

/** Eingebaute Internet-Tarife, wenn die Tarifverwaltung nichts liefert (v1 FALLBACK_TARIFFS). */
export const FALLBACK_TARIFFS = {
  "kabel-neu": [
    { id: "k50", name: "50", first9: 19.99, after9: 39.99, startguthaben: 0, bandwidth: 50 },
    { id: "k100", name: "100", first9: 19.99, after9: 44.99, startguthaben: 50, bandwidth: 100 },
    { id: "k250", name: "250", first9: 19.99, after9: 49.99, startguthaben: 50, bandwidth: 250 },
    { id: "k500", name: "500", first9: 19.99, after9: 54.99, startguthaben: 80, bandwidth: 500 },
    { id: "k1000", name: "1000", first9: 19.99, after9: 64.99, startguthaben: 80, bandwidth: 1000 },
    { id: "kmax", name: "CableMax", first9: 49.99, after9: 49.99, startguthaben: 0, bandwidth: 1000 },
  ],
  dsl: [
    { id: "d16", name: "16", firstA: 19.99, afterA: 34.99, bandwidth: 16 },
    { id: "d50", name: "50", firstA: 19.99, afterA: 39.99, bandwidth: 50 },
    { id: "d100", name: "100", firstA: 19.99, afterA: 44.99, bandwidth: 100 },
    { id: "d250", name: "250", firstA: 19.99, afterA: 49.99, bandwidth: 250 },
  ],
  glasfaser: [
    { id: "f100", name: "100", first9: 19.99, after9: 44.99, bandwidth: 100 },
    { id: "f250", name: "250", first9: 19.99, after9: 49.99, bandwidth: 250 },
    { id: "f500", name: "500", first9: 19.99, after9: 54.99, bandwidth: 500 },
    { id: "f1000", name: "1000", first9: 19.99, after9: 79.99, bandwidth: 1000 },
  ],
  "kabel-bestand": [
    { id: "u50", name: "50", monthly: 39.99, bandwidth: 50 },
    { id: "u100", name: "100", monthly: 44.99, bandwidth: 100 },
    { id: "u250", name: "250", monthly: 49.99, bandwidth: 250 },
    { id: "u500", name: "500", monthly: 54.99, bandwidth: 500 },
    { id: "u1000", name: "1000", monthly: 64.99, bandwidth: 1000 },
  ],
};

/** Kabel Upsell Treuepreise (5 € billiger), Geheimfunktion: 5× auf "Internet + Festnetz". */
export const UPSELL_LOYALTY_TARIFFS: SimpleTariff[] = [
  { id: "lu50", name: "50 Treue", monthly: 34.99 },
  { id: "lu150", name: "150 Treue", monthly: 39.99 },
  { id: "lu300", name: "300 Treue", monthly: 44.99 },
  { id: "lu600", name: "600 Treue", monthly: 49.99 },
  { id: "lu1000", name: "1000 Treue", monthly: 59.99 },
];

/** Kabel Upsell Winback, Geheimfunktion: 10× tippen. */
export const UPSELL_WINBACK_TARIFFS: SimpleTariff[] = [
  { id: "wb50", name: "50 Winback", monthly: 29.99 },
  { id: "wb100", name: "100 Winback", monthly: 34.99 },
  { id: "wb250", name: "250 Winback", monthly: 39.99 },
  { id: "wb500", name: "500 Winback", monthly: 44.99 },
  { id: "wb1000", name: "1000 Winback", monthly: 54.99 },
];

export const ROUTERS_CABLE: RouterOption[] = [
  { id: "none", name: "Kein Router", monthly: 0, oneTime: 0 },
  { id: "vs_miete", name: "Vodafone Station (Miete)", monthly: 3.99, oneTime: 0 },
  { id: "uh7_miete", name: "Ultra Hub 7 Kabel (Miete)", monthly: 4.99, oneTime: 0 },
  { id: "fb6591_miete", name: "FRITZ!Box 6591 (Miete)", monthly: 4.99, oneTime: 0 },
  { id: "fb6670_miete", name: "FRITZ!Box 6670 (Miete)", monthly: 6.99, oneTime: 0 },
  { id: "fb6690_miete", name: "FRITZ!Box 6690 (Miete)", monthly: 9.99, oneTime: 0 },
];

export const ROUTERS_FIBER_DSL: RouterOption[] = [
  { id: "none", name: "Kein Router", monthly: 0, oneTime: 0 },
  { id: "7530ax_miete", name: "FRITZ!Box 7530 AX (Miete)", monthly: 5.99, oneTime: 0, ont: false },
  { id: "7530ax_kauf", name: "FRITZ!Box 7530 AX (Kauf)", monthly: 0, oneTime: 139.9, ont: true },
  { id: "7690_miete", name: "FRITZ!Box 7690 (Miete)", monthly: 8.99, oneTime: 0, ont: false },
  { id: "7690_kauf", name: "FRITZ!Box 7690 (Kauf)", monthly: 0, oneTime: 229.9, ont: true },
  { id: "5530_miete", name: "FRITZ!Box 5530 (Miete)", monthly: 5.99, oneTime: 0, ont: false },
  { id: "5530_kauf", name: "FRITZ!Box 5530 (Kauf)", monthly: 0, oneTime: 139.9, ont: false },
  { id: "5690_miete", name: "FRITZ!Box 5690 (Miete)", monthly: 8.99, oneTime: 0, ont: false },
  { id: "5690_kauf", name: "FRITZ!Box 5690 (Kauf)", monthly: 0, oneTime: 229.9, ont: false },
];

export const FESTNETZ_PLANS: FestnetzOption[] = [
  { id: "tel_flat", name: "Telefonflatrate ins Festnetz", monthly: 0 },
  { id: "nat_mobil_flat", name: "Nationale Mobilflat", monthly: 0 },
  { id: "mobile_international_flat", name: "Mobile und Internationale Flat", monthly: 14.99 },
  { id: "mobile_international_allnet", name: "Mobile und Internationale AllnetFlat", monthly: 19.99 },
  { id: "eurflat_plus", name: "Eurflat plus", monthly: 4.99 },
];

/** Feste Beträge aus v1. */
export const TELCO_FEES = {
  tariffChange: 9.99,
  tvAutoDiscount: 12.99,
  tvConnectStandard: 12.99,
  tvCombo: 5,
  multiroom: 5,
  multiroomMax: 2,
  ont: 49.9,
  addonFallback: 9.99,
  gigaKombiFallback: 10,
  familyCardsMax: 4,
  secretTapsLoyalty: 5,
  secretTapsWinback: 10,
} as const;
