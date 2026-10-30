import type { SimTariff, TariffsByCategory } from "./simulatorTypes";

type Row = readonly [name: string, commission: number, price?: number, bandwidth?: number];

const rows = (category: string, list: readonly Row[]): SimTariff[] =>
  list.map(([name, commissionEuro, price, bandwidth], i) => ({ id: `demo-${category}-${i}`, name, category, commissionEuro, price, bandwidth }));

/**
 * Beispieltarife für den Demo-Modus. Telco-Provisionen 1:1 aus v1 DEFAULT_COMMISSION_RATES (types/commission.ts),
 * Preise aus den eingebauten Tarifen. Für Strom und Gas kennt v1 keine Provisionen, das sind Schätzwerte.
 */
export const DEMO_TARIFFS: TariffsByCategory = {
  "kabel-neu": rows("kabel-neu", [
    ["Giga Zuhause 1000 Kabel", 175, 19.99, 1000],
    ["CableMax 1000", 175, 49.99, 1000],
    ["Giga Zuhause 500 Kabel", 150, 19.99, 500],
    ["Giga Zuhause 250 Kabel", 130, 19.99, 250],
    ["Giga Zuhause 100 Kabel", 95, 19.99, 100],
    ["Giga Zuhause 50 Kabel", 50, 19.99, 50],
  ]),
  glasfaser: rows("glasfaser", [
    ["Glasfaser 1000", 175, 19.99, 1000],
    ["Glasfaser 500", 150, 19.99, 500],
    ["Glasfaser 250", 130, 19.99, 250],
    ["Glasfaser 100", 95, 19.99, 100],
  ]),
  dsl: rows("dsl", [
    ["DSL 250", 175, 19.99, 250],
    ["DSL 100", 130, 19.99, 100],
    ["DSL 50", 95, 19.99, 50],
    ["DSL 16", 50, 19.99, 16],
  ]),
  tv: rows("tv", [
    ["TV Connect Standard", 50],
    ["TV Connect zuhause", 30],
    ["Giga TV Home Sound inkl. Netflix", 25],
    ["Giga TV Home Cable inkl. Netflix", 20],
    ["Giga TV Home Sound inkl. Premium", 20],
    ["Giga TV Home Cable inkl. Premium", 15],
    ["Giga TV Home Sound", 15],
    ["Giga TV Home Cable", 10],
    ["GigaTV Mobile-App", 5],
    ["Basic TV", 2],
  ]),
  mobil: rows("mobil", [
    ["GigaMobil XL", 15],
    ["GigaMobil M", 10],
    ["GigaMobil S", 8],
    ["GigaMobil XS", 5],
    ["Family Card XL", 8],
    ["Family Card L", 5],
    ["Family Card M", 3],
    ["Family Card S", 2],
  ]),
  "kabel-bestand": rows("kabel-bestand", [
    ["1000 Winback", 55, 54.99],
    ["250 Winback", 34, 39.99],
  ]),
  router: rows("router", [
    ["Vodafone Station (Miete)", 0, 3.99],
    ["FRITZ!Box 6690 (Miete)", 0, 9.99],
  ]),
  strom: rows("strom", [
    ["Strom Gewerbe", 90],
    ["Strom Privat Öko", 45],
    ["Strom Privat", 40],
  ]),
  gas: rows("gas", [
    ["Gas Gewerbe", 110],
    ["Gas Privat", 55],
  ]),
};
