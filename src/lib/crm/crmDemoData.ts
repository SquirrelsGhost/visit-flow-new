import type { SaleRecord } from "./crmTypes";

type Seed = [daysAgo: number, customer: string, address: string, products: [category: string, type: string, euro: number][], note?: string];

const TELCO: Seed[] = [
  [0, "Familie Krüger", "Lindenstraße 4, 50667 Köln", [["KIP", "GigaZuhause 1000 Kabel (1000 Mbit/s)", 175], ["KAS", "TV Connect zuhause", 10]]],
  [1, "S. Yilmaz", "Bachweg 12, 50667 Köln", [["Mobile", "GigaMobil M", 95]]],
  [2, "Herr Becker", "Rosenhof 3, 50668 Köln", [["Upsell", "GigaTV Upsell (Upsell Giga Grade 3) - AP: 39.99€", 60]]],
  [4, "M. Schulte", "Am Markt 8, 50667 Köln", [["KIP", "GigaZuhause 500 Kabel (500 Mbit/s)", 150], ["GigaTV", "GigaTV Net", 45], ["KAS", "TV Connect zuhause", 10]], "Rückruf wegen Installationstermin"],
  [6, "Familie Özdemir", "Gartenstraße 21, 50668 Köln", [["Mobile", "GigaMobil S", 70], ["Mobile", "GigaMobil S", 70]], "[STORNIERT] (Verlustgrund: Widerruf innerhalb 14 Tagen)"],
  [9, "Frau Wagner", "Kirchplatz 2, 50667 Köln", [["Glasfaser", "Glasfaser 300 (300 Mbit/s)", 160]]],
  [12, "L. Hoffmann", "Birkenallee 17, 50670 Köln", [["KIP", "GigaZuhause 250 Kabel (250 Mbit/s)", 125], ["KAS", "TV Connect zuhause", 10]]],
  [15, "Herr Neumann", "Mühlenweg 5, 50670 Köln", [["Upsell", "GigaZuhause 1000 Upsell - AP: 44.99€", 78]]],
  [17, "Familie Braun", "Talstraße 30, 50672 Köln", [["KIP", "GigaZuhause 1000 Kabel (1000 Mbit/s)", 175]], "[ABGESCHLOSSEN]"],
  [19, "P. Schmitz", "Ringstraße 44, 50672 Köln", [["GigaTV", "GigaTV Net", 45]], "[STORNIERT] (Verlustgrund: Bonität abgelehnt)"],
  [21, "Frau Koch", "Weiherstraße 9, 50674 Köln", [["Mobile", "GigaMobil L", 120], ["Mobile", "GigaMobil M", 95]], "[ABGESCHLOSSEN]"],
  [24, "A. Richter", "Feldweg 11, 50674 Köln", [["KIP", "GigaZuhause 500 Kabel (500 Mbit/s)", 150]]],
  [33, "Familie Wolf", "Hauptstraße 70, 50676 Köln", [["KIP", "GigaZuhause 1000 Kabel (1000 Mbit/s)", 175]], "[ABGESCHLOSSEN]"],
  [38, "J. Klein", "Parkstraße 6, 50676 Köln", [["Mobile", "GigaMobil S", 70]], "[STORNIERT]"],
];

const SOLAR: Seed[] = [
  [0, "Familie Lehmann", "Sonnenweg 3, 50859 Köln", [["Solar_PV", "Direkt-Lead", 80]]],
  [2, "Herr Vogel", "Ahornstraße 14, 50859 Köln", [["Solar_PV", "PV-Anlage 9,8 kWp", 90]]],
  [5, "M. Hartmann", "Eichenring 7, 50858 Köln", [["Solar_PV", "Direkt-Lead", 80]], "[STORNIERT] (Verlustgrund: Dach ungeeignet)"],
  [8, "Frau Krause", "Lerchenweg 22, 50858 Köln", [["Speicher", "Speicher 10 kWh", 90]], "[ABGESCHLOSSEN]"],
  [11, "Familie Berg", "Am Hang 1, 50857 Köln", [["Solar_PV", "Direkt-Lead", 80]], "[ABGESCHLOSSEN]"],
  [16, "T. Schwarz", "Wiesenstraße 9, 50857 Köln", [["Solar_PV", "Direkt-Lead", 80]], "[ABGESCHLOSSEN]"],
];

const ENERGY: Seed[] = [
  [1, "Familie Roth", "Kastanienweg 5, 50733 Köln", [["Strom", "Ökostrom Plus", 55]]],
  [3, "Herr Frank", "Uferstraße 18, 50733 Köln", [["Strom", "Strom Basis", 45], ["Gas", "Gas Komfort", 50]]],
  [10, "S. Graf", "Buchenweg 2, 50735 Köln", [["Gas", "Gas Komfort", 50]], "[STORNIERT] (Verlustgrund: Kunde bleibt beim Versorger)"],
  [16, "Familie Lang", "Seestraße 40, 50735 Köln", [["Strom", "Ökostrom Plus", 55]], "[ABGESCHLOSSEN]"],
];

const DAY = 24 * 60 * 60 * 1000;

function build(prefix: string, seeds: readonly Seed[], now: number): SaleRecord[] {
  return seeds.flatMap(([days, customerName, address, products, notes], i) =>
    products.map(([category, type, commissionEuro], j) => ({
      id: `${prefix}-${i}-${j}`,
      doorId: `${prefix}-door-${i}`,
      category,
      type,
      quantity: 1,
      // Mittags, damit ein Auftrag nicht über Mitternacht in zwei Tage zerfällt
      timestamp: new Date(new Date(now - days * DAY).setHours(12, 30 - i, 0, 0)).toISOString(),
      notes,
      commissionEuro,
      customerName,
      address,
    })),
  );
}

/** Beispiel-Aufträge aller Bereiche, relativ zu heute. */
export function demoSales(now = Date.now()): SaleRecord[] {
  return [...build("t", TELCO, now), ...build("s", SOLAR, now), ...build("e", ENERGY, now)];
}
