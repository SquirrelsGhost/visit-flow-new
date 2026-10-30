import type { Vertical } from "../battle/battleCategories";
import type { DoorProduct, MapDoor, MapHouse, VisitStatus } from "../map/mapTypes";
import type { ProductCategory } from "../map/productMeta";

/** Ablauf eines Beispieltags: Status je Tür; die Zahl hinter "Sale" ist der Index in SALES. */
const DAY: readonly (VisitStatus | number)[] = [
  "N/A", "Angetroffen → Kein Interesse", 0, "N/A", "Angetroffen → Termin", "N/A", "Angetroffen → Versorgt", 1,
  "Angetroffen → Kein Interesse", "N/A", "N/A", 2, "Angetroffen → Termin", "Angetroffen → Kein Interesse", "N/A",
  "Angetroffen → Versorgt", 3, "N/A", "Angetroffen → Kein Interesse", "N/A", "Angetroffen → Termin", "N/A",
  "Angetroffen → Kein Interesse", 4, "N/A", "N/A", "Angetroffen → Versorgt", "N/A",
];

/** Verkaufte Produkte der Beispiel-Abschlüsse je Sparte. */
const SALES: Record<Vertical, readonly (readonly ProductCategory[])[]> = {
  telco: [["KIP", "GigaTV"], ["Glasfaser"], ["Mobile", "Mobile"], ["KIP", "Upsell"], ["KAS", "Zubehör"]],
  energy: [["Strom"], ["Strom", "Gas"], ["Gas"], ["Strom"], ["Strom", "Gas"]],
  solar: [["Solar_PV", "Speicher"], ["Solar_Miete"], ["Solar_PV"], ["Waermepumpe"], ["Solar_PV", "Wallbox"]],
};

const STREETS = ["Lindenstraße", "Ahornweg", "Birkenallee"] as const;

function product(category: ProductCategory, vertical: Vertical, at: string, index: number): DoorProduct {
  return { id: `demo-p-${index}-${category}`, category, subCategory: category, type: category, quantity: 1, isPointRelevant: true, isPremium: false, vertical, timestamp: at };
}

/**
 * Ein Beispieltag für den Demo-Modus: 28 Türen ab 9 Uhr, alle sieben Minuten eine,
 * mit Abschlüssen passend zur Sparte. Nur zum Ansehen, nichts wird gespeichert.
 */
export function demoTodayHouses(vertical: Vertical, now: Date = new Date()): MapHouse[] {
  const start = new Date(now);
  start.setHours(9, 0, 0, 0);
  return DAY.map((entry, i) => {
    const at = new Date(Math.min(start.getTime() + i * 7 * 60_000, now.getTime())).toISOString();
    const sale = typeof entry === "number";
    const status: VisitStatus = sale ? "Angetroffen → Sale" : entry;
    const products = sale ? (SALES[vertical][entry] ?? []).map((c, k) => product(c, vertical, at, i * 10 + k)) : [];
    const door: MapDoor = { id: `demo-d-${i}`, name: "Haupteingang", status, timestamp: at, products };
    return {
      id: `demo-h-${i}`,
      street: STREETS[i % STREETS.length] ?? "Lindenstraße",
      houseNumber: String(2 + i),
      zipCode: "10115",
      city: "Berlin",
      type: "EFH",
      latitude: 52.53,
      longitude: 13.38,
      status,
      doors: [door],
    };
  });
}
