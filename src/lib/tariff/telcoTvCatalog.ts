import type { FamilyCardOption, GigaTvOption, MobilePlan } from "./telcoTypes";

/** TV für Neukunden (v1 baseOptionsNeu). */
export const GIGATV_NEU: GigaTvOption[] = [
  { id: "none", name: "Kein TV", a: 0, b: 0, oneTime: 0, needsShipping: false },
  { id: "gtv_basic", name: "Giga TV Home Cable", a: 9.99, b: 14.99, oneTime: 49.99, needsShipping: true },
  { id: "gtv_premium", name: "Giga TV Home Cable inkl. Premium", a: 14.99, b: 19.99, oneTime: 49.99, needsShipping: true, includesPremium: true },
  { id: "gtv_netflix", name: "Giga TV Home Cable inkl. Netflix", a: 19.99, b: 25.99, oneTime: 49.99, needsShipping: true, includesNetflix: true },
  { id: "gtv_sound", name: "Giga TV Home Sound", a: 14.99, b: 19.99, oneTime: 49.99, needsShipping: true },
  { id: "gtv_sound_premium", name: "Giga TV Home Sound inkl. Premium", a: 19.99, b: 24.99, oneTime: 49.99, needsShipping: true, includesPremium: true },
  { id: "gtv_sound_netflix", name: "Giga TV Home Sound inkl. Netflix", a: 24.99, b: 30.99, oneTime: 49.99, needsShipping: true, includesNetflix: true },
  { id: "gtv_app", name: "GigaTV Mobile-App", a: 9.99, b: 9.99, oneTime: 0, needsShipping: false },
  { id: "tv_connect", name: "TV Connect", a: 19.99, b: 19.99, oneTime: 0, needsShipping: false },
  { id: "tv_connect_standard", name: "TV Connect Standard", a: 12.99, b: 12.99, oneTime: 0, needsShipping: false },
  { id: "tv_basic", name: "Basic TV", a: 3.99, b: 3.99, oneTime: 0, needsShipping: false },
];

/** TV für Kunden, die schon Giga TV haben ("Bereits Giga", v1 baseOptionsBestand). */
export const GIGATV_BESTAND: GigaTvOption[] = [
  { id: "none", name: "Kein TV", a: 0, b: 0, oneTime: 0, needsShipping: false },
  { id: "gtvu_basic", name: "Giga TV Home Cable (Upsell)", a: 14.99, b: 14.99, oneTime: 49.99, needsShipping: true },
  { id: "gtvu_premium", name: "Giga TV Home Cable inkl. Premium (Upsell)", a: 19.99, b: 19.99, oneTime: 49.99, needsShipping: true, includesPremium: true },
  { id: "gtvu_netflix", name: "Giga TV Home Cable inkl. Netflix (Upsell)", a: 25.99, b: 25.99, oneTime: 49.99, needsShipping: true, includesNetflix: true },
  { id: "gtvu_sound", name: "Giga TV Home Sound (Upsell)", a: 19.99, b: 19.99, oneTime: 49.99, needsShipping: true },
  { id: "gtvu_sound_premium", name: "Giga TV Home Sound inkl. Premium (Upsell)", a: 24.99, b: 24.99, oneTime: 49.99, needsShipping: true, includesPremium: true },
  { id: "gtvu_sound_netflix", name: "Giga TV Home Sound inkl. Netflix (Upsell)", a: 30.99, b: 30.99, oneTime: 49.99, needsShipping: true, includesNetflix: true },
];

/** TV-Tarife, auf die der 12,99-€-Rabatt direkt wirkt. */
export const NEW_TV_TARIFF_IDS = ["tv_connect", "tv_connect_standard", "tv_basic"];

export const MOBILE_PLANS: MobilePlan[] = [
  { id: "none", name: "Kein Mobile", baseMonthly: 0, promo20Discount: 0 },
  { id: "gm_xs", name: "GigaMobil XS", baseMonthly: 29.99, promo20Discount: 6, dataGb: 7 },
  { id: "gm_s", name: "GigaMobil S", baseMonthly: 39.99, promo20Discount: 8, dataGb: 25 },
  { id: "gm_m", name: "GigaMobil M", baseMonthly: 49.99, promo20Discount: 10, dataGb: 50, supportsUnlimitedUpgrade: true },
  { id: "gm_l", name: "GigaMobil L", baseMonthly: 59.99, promo20Discount: 12, dataGb: 280, supportsUnlimitedUpgrade: true },
  { id: "gm_xl", name: "GigaMobil XL", baseMonthly: 79.99, promo20Discount: 16 },
];

export const FAMILY_CARDS: FamilyCardOption[] = [
  { id: "fc_s", name: "Family Card S", dataGb: 5, monthly: 8.99 },
  { id: "fc_m", name: "Family Card M", dataGb: 20, monthly: 14.99 },
  { id: "fc_l", name: "Family Card L", dataGb: 999, monthly: 19.99 },
  { id: "fc_xl", name: "Family Card XL", dataGb: 999, monthly: 29.99 },
];
