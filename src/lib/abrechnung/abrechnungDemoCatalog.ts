import type { AbrechnungCategory } from "./abrechnungTypes";

/** Beispielprodukte mit Provision. Telco-Beträge aus v1 DEFAULT_COMMISSION_RATES, Leads/Energie geschätzt. */
export interface DemoProduct {
  name: string;
  amount: number;
  /** Relative Häufigkeit */
  weight: number;
}

export const DEMO_PRODUCTS: Record<AbrechnungCategory, DemoProduct[]> = {
  vodafone: [
    { name: "Giga Zuhause 1000 Kabel", amount: 175, weight: 6 },
    { name: "Giga Zuhause 500 Kabel", amount: 150, weight: 5 },
    { name: "Giga Zuhause 250 Kabel", amount: 130, weight: 5 },
    { name: "Giga Zuhause 100 Kabel", amount: 95, weight: 3 },
    { name: "Glasfaser 1000", amount: 175, weight: 3 },
    { name: "Glasfaser 500", amount: 150, weight: 3 },
    { name: "DSL 100", amount: 130, weight: 2 },
    { name: "GigaTV Home Cable", amount: 10, weight: 4 },
    { name: "GigaTV inkl. Netflix", amount: 20, weight: 2 },
    { name: "GigaMobil M", amount: 60, weight: 3 },
    { name: "Upsell Kabel 250 auf 1000", amount: 45, weight: 3 },
    { name: "FRITZ!Box Router", amount: 15, weight: 2 },
  ],
  leads: [
    { name: "PV-Lead qualifiziert", amount: 60, weight: 9 },
    { name: "PV-Lead mit Termin", amount: 80, weight: 4 },
    { name: "Direkt-Lead", amount: 35, weight: 5 },
    { name: "Speicher-Lead", amount: 40, weight: 3 },
    { name: "Wärmepumpe-Lead", amount: 45, weight: 3 },
    { name: "Wallbox-Lead", amount: 25, weight: 2 },
  ],
  energy: [
    { name: "Strom Privat Öko", amount: 45, weight: 6 },
    { name: "Strom Privat", amount: 40, weight: 5 },
    { name: "Gas Privat", amount: 55, weight: 5 },
    { name: "Strom Gewerbe", amount: 90, weight: 2 },
    { name: "Gas Gewerbe", amount: 110, weight: 1 },
  ],
};

/** Verkäufe pro Monat (von, bis). */
export const DEMO_VOLUME: Record<AbrechnungCategory, [number, number]> = {
  vodafone: [18, 30],
  leads: [26, 44],
  energy: [16, 28],
};

export const DEMO_FILE: Record<AbrechnungCategory, string> = {
  vodafone: "Provisionsabrechnung",
  leads: "Leadabrechnung",
  energy: "Energie-Abrechnung",
};

export const DEMO_STREETS = [
  "Lindenstraße", "Goethestraße", "Am Mühlbach", "Bahnhofstraße", "Rosenweg", "Schillerplatz", "Eichendorffweg",
  "Gartenstraße", "Kirchgasse", "Ahornallee", "Bergstraße", "Uhlandstraße", "Feldweg", "Hauptstraße", "Wiesenring",
  "Mozartstraße", "Talstraße", "Birkenhof", "Sonnenhang", "Marktplatz",
] as const;

export const DEMO_NAMES = [
  "M. Krüger", "S. Yılmaz", "A. Becker", "J. Hoffmann", "L. Wagner", "K. Schulz", "T. Nowak", "E. Fischer",
  "D. Petrović", "R. Braun", "N. Kaya", "P. Zimmermann", "C. Richter", "F. Wolf", "H. Schäfer", "B. Arslan",
  "I. Klein", "O. Neumann", "G. Lehmann", "V. Schmitt",
] as const;

export const DEMO_CITIES = [
  { zip: "70173", city: "Stuttgart" },
  { zip: "70372", city: "Stuttgart" },
  { zip: "71638", city: "Ludwigsburg" },
  { zip: "73728", city: "Esslingen" },
] as const;

/** Kleiner, fester Zufallsgenerator: gleiche Demo bei jedem Laden (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T,>(rnd: () => number, list: readonly T[]): T => list[Math.floor(rnd() * list.length)] as T;

export function pickWeighted(rnd: () => number, list: readonly DemoProduct[]): DemoProduct {
  const total = list.reduce((s, p) => s + p.weight, 0);
  let roll = rnd() * total;
  for (const p of list) {
    roll -= p.weight;
    if (roll <= 0) return p;
  }
  return list[list.length - 1] as DemoProduct;
}
