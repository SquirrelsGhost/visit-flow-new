/** Tarif-Kategorien und Tarif aus der v1-Tarifverwaltung (components/admin/TarifsManagement). */
export type TariffCategory = "kabel-neu" | "kabel-bestand" | "glasfaser" | "dsl" | "tv" | "mobil" | "router" | "strom" | "gas";

export interface TariffPeriod {
  label: string;
  months: string;
  price: number;
}

export interface Tariff {
  id: string;
  name: string;
  category: TariffCategory;
  bandwidth?: number;
  periods: TariffPeriod[];
  oneTimeCosts?: { setup?: number; shipping?: number };
  startCredit?: number;
  isLoyalty?: boolean;
  isWinback?: boolean;
  mobileData?: number;
  promoDiscount?: number;
  gigaKombiDiscount?: number;
  supportsUnlimitedUpgrade?: boolean;
  isFamilyCard?: boolean;
  isKAS?: boolean;
  /** GigaTV-Zusätze und GigaCube (v1 SaleDialog) */
  isMultiroom?: boolean;
  isPayTV?: boolean;
  isGigaCube?: boolean;
  gigaCubeHardware?: { z21Monthly?: number; z21OneTime?: number; z22Monthly?: number; z22OneTime?: number };
  commissionEuro?: number;
  provider?: string;
  vertical?: string;
  attributes?: Partial<EnergyTariffAttributes>;
  isActive: boolean;
}

/** Tarif im Format des Pencil Sell (v1 useTariffs PencilSellTariff). */
export interface PencilSellTariff {
  id: string;
  name: string;
  first6?: number;
  sevenToNine?: number;
  first9?: number;
  after9?: number;
  firstA?: number;
  afterA?: number;
  monthly?: number;
  startguthaben?: number;
  bandwidth?: number;
}

/** Preise eines Strom- oder Gastarifs, brutto (v1 EnergyTariffAttributes). */
export interface EnergyTariffAttributes {
  arbeitspreisCt: number;
  grundpreisEuroMonat: number;
  bonusEuro?: number;
  preisgarantieMonate?: number;
  laufzeitMonate?: number;
  oeko?: boolean;
}
