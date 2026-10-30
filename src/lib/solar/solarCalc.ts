/**
 * PV-Rechnung für den Pencil Sell (1:1 aus v1 SolarPencilSell). Reine Funktionen ohne React.
 * Preise und Faktoren sind Richtwerte für Deutschland (0 % MwSt. auf PV).
 */
export type Orientation = "south" | "east-west" | "north";
export type Acquisition = "miete" | "kauf";

export interface SolarInput {
  consumptionKwh: number;
  roofSqm: number;
  orientation: Orientation;
  batteryKwh: number;
  mode: Acquisition;
  financed: boolean;
  /** €/kWh */
  electricityPrice: number;
  /** €/kWh */
  feedInTariff: number;
  /** Prozent pro Jahr */
  inflation: number;
}

export const DEFAULT_SOLAR: SolarInput = {
  consumptionKwh: 4000,
  roofSqm: 60,
  orientation: "south",
  batteryKwh: 5,
  mode: "miete",
  financed: true,
  electricityPrice: 0.38,
  feedInTariff: 0.082,
  inflation: 3,
};

const PANEL_SQM = 2;
const PANEL_WP = 430;
const YIELD: Record<Orientation, number> = { south: 1020, "east-west": 860, north: 550 };

/** Autarkie nach dem Näherungsmodell der HTW Berlin: ohne Speicher bis 38 %, mit Speicher bis 88 %. */
function autarky(genKwh: number, consumptionKwh: number, batteryKwh: number): number {
  if (!(consumptionKwh > 0) || !(genKwh >= 0)) return 30;
  const ratio = Math.max(0, genKwh / consumptionKwh);
  const base = Math.min(38, 25 * Math.pow(Math.min(2.5, ratio), 0.4));
  if (!(batteryKwh > 0)) return Math.round(base);
  const days = batteryKwh / (consumptionKwh / 365);
  const boost = 45 * Math.pow(Math.min(2, days), 0.5) * Math.pow(Math.min(1.5, ratio), 0.25);
  return Math.round(Math.min(88, base + boost));
}

export function calculateSolar(i: SolarInput) {
  const maxPanels = Math.max(1, Math.floor((Number(i.roofSqm) || 0) / PANEL_SQM));
  const kWp = Math.max(0, parseFloat(((maxPanels * PANEL_WP) / 1000).toFixed(1)));
  const specYield = YIELD[i.orientation] ?? YIELD.south;
  const yearlyGenKwh = Math.round(kWp * specYield);
  const autarkyPercent = autarky(yearlyGenKwh, i.consumptionKwh, i.batteryKwh);
  const selfConsumedKwh = Math.min(yearlyGenKwh, i.consumptionKwh * (autarkyPercent / 100));
  const gridExportKwh = Math.max(0, yearlyGenKwh - selfConsumedKwh);
  const feedInRevenue = gridExportKwh * i.feedInTariff;
  const yearlySavingsEuro = Math.round(selfConsumedKwh * i.electricityPrice + feedInRevenue);
  const investmentCost = Math.round(2500 + kWp * 1100 + i.batteryKwh * 500);
  const amortizationYears = yearlySavingsEuro > 0 ? parseFloat((investmentCost / yearlySavingsEuro).toFixed(1)) : 0;
  const co2SavingsTons = parseFloat(((yearlyGenKwh * 0.384) / 1000).toFixed(2));
  const monthlyRentalRate = Math.round(50 + kWp * 8 + i.batteryKwh * 4);
  const monthlyFinancingRate = Math.round(investmentCost * 0.0055);
  const altMonthlyCost = Math.round((i.consumptionKwh * i.electricityPrice) / 12);
  const residualKwh = i.consumptionKwh - selfConsumedKwh;
  const remainingGridCostMonthly = Math.round((residualKwh * i.electricityPrice - feedInRevenue) / 12);
  const solarMonthly = i.mode === "miete" ? monthlyRentalRate : i.financed ? monthlyFinancingRate : 0;
  const newMonthlyCost = solarMonthly + remainingGridCostMonthly;

  let totalAlt = 0;
  let totalNeu = i.mode === "kauf" && !i.financed ? investmentCost : 0;
  const inflationPct = Number.isFinite(i.inflation) ? i.inflation : 3;
  const factor = 1 + inflationPct / 100;
  for (let year = 1; year <= 20; year++) {
    const price = i.electricityPrice * Math.pow(factor, year - 1);
    totalAlt += i.consumptionKwh * price;
    totalNeu += residualKwh * price - feedInRevenue + solarMonthly * 12;
  }

  return {
    kWp,
    maxPanels,
    yearlyGenKwh,
    autarkyPercent,
    yearlySavingsEuro,
    investmentCost,
    amortizationYears,
    co2SavingsTons,
    monthlyRentalRate,
    monthlyFinancingRate,
    altMonthlyCost,
    newMonthlyCost,
    monthlySavings: altMonthlyCost - newMonthlyCost,
    remainingGridCostMonthly,
    /** Netzbezug ohne Gutschrift, pro Monat */
    gridPurchaseMonthly: Math.max(0, Math.round((residualKwh * i.electricityPrice) / 12)),
    feedInMonthly: Math.round(feedInRevenue / 12),
    selfConsumedKwh,
    gridExportKwh,
    totalAlt20Years: Math.round(totalAlt),
    totalNeu20Years: Math.round(totalNeu),
    totalSavings20Years: Math.round(totalAlt - totalNeu),
    /** Heutiger Abschlag nach 20 Jahren Preissteigerung */
    altMonthlyIn20Years: Math.round(altMonthlyCost * Math.pow(1 + inflationPct / 100, 20)),
    trees: Math.round(co2SavingsTons * 80),
  };
}

export type SolarResult = ReturnType<typeof calculateSolar>;

/** Wirtschaftlichste Größe: 1 kWp je 800 kWh Verbrauch, 5 m² je kWp, 1 kWh Speicher je kWp. */
export function autoOptimize(consumptionKwh: number): Pick<SolarInput, "roofSqm" | "batteryKwh"> {
  const kwp = Math.max(0, (Number(consumptionKwh) || 0) / 800);
  return {
    roofSqm: Math.max(15, Math.min(150, Math.round(kwp * 5))),
    batteryKwh: Math.max(0, Math.min(20, Math.round(kwp))),
  };
}
