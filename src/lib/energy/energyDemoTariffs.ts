import type { Tariff, TariffCategory } from "../tariff/tariffTypes";

const tarif = (id: string, category: "strom" | "gas", name: string, attributes: Tariff["attributes"]): Tariff => ({
  id,
  name,
  category,
  periods: [],
  attributes,
  isActive: true,
});

/** Beispieltarife für den Demo-Modus, damit der Vergleich ohne Server etwas zum Antippen hat. */
const DEMO: Tariff[] = [
  tarif("demo-strom-basis", "strom", "Strom Basis", { arbeitspreisCt: 29.9, grundpreisEuroMonat: 12.5, preisgarantieMonate: 12 }),
  tarif("demo-strom-oeko", "strom", "Strom Öko 24", {
    arbeitspreisCt: 27.5,
    grundpreisEuroMonat: 14.9,
    bonusEuro: 100,
    preisgarantieMonate: 24,
    oeko: true,
  }),
  tarif("demo-gas-basis", "gas", "Gas Basis", { arbeitspreisCt: 9.8, grundpreisEuroMonat: 13.9, preisgarantieMonate: 12 }),
  tarif("demo-gas-plus", "gas", "Gas Plus 24", { arbeitspreisCt: 8.9, grundpreisEuroMonat: 15.5, bonusEuro: 80, preisgarantieMonate: 24 }),
];

export const demoEnergyTariffs = (category: TariffCategory): Tariff[] => DEMO.filter((t) => t.category === category);
