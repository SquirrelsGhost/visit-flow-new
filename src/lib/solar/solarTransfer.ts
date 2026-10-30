import type { TransferProduct } from "../tariff/pencilSellStorage";
import type { SolarInput } from "./solarCalc";

/** Produkte für den Verkaufsdialog, Bezeichnungen wie in v1, damit der Dialog sie wiedererkennt. */
export function solarProducts(i: SolarInput): TransferProduct[] {
  const rental = i.mode === "miete";
  const products: TransferProduct[] = [
    {
      category: rental ? "Solar_Miete" : "Solar_PV",
      type: rental ? "PV Miete - Standard (10 kWp)" : "PV Kauf - Standard (10 kWp)",
      quantity: 1,
    },
  ];
  if (i.batteryKwh > 0) {
    products.push({
      category: "Speicher",
      type: i.batteryKwh >= 10 ? "Batteriespeicher 10 kWh" : "Batteriespeicher 5 kWh",
      quantity: 1,
    });
  }
  return products;
}
