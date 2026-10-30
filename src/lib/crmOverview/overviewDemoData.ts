import type { RawRecord } from "./overviewLogic";

/** Beispiel-Türen: zwei davon mit Lücken, damit "Nur Probleme" etwas zeigt. */
const DOORS: readonly [string, string, string, string][] = [
  ["Familie Krüger", "Lindenallee", "12", "Köln"],
  ["Bäckerei Sommer", "Hauptstraße", "3", "Köln"],
  ["Weber, Anna", "Am Stadtpark", "7a", "Bonn"],
  ["Yilmaz, Mehmet", "Rheinufer", "21", "Bonn"],
  ["Praxis Dr. Lang", "Goethestraße", "45", "Düsseldorf"],
  ["Schmitt, Paul", "Bergweg", "2", "Leverkusen"],
  ["Hoffmann GmbH", "Industriestraße", "88", "Köln"],
  ["Nowak, Ewa", "Kirchplatz", "5", "Bonn"],
  ["Becker, Jonas", "Ahornweg", "14", "Düsseldorf"],
  ["Café Linde", "Marktstraße", "1", "Köln"],
  ["", "Wiesenstraße", "9", "Köln"],
  ["Richter, Lea", "", "", "Bonn"],
  ["Fischer, Tim", "Brunnenweg", "30", "Leverkusen"],
  ["Autohaus Kaya", "Ringstraße", "120", "Düsseldorf"],
];

const SELLERS = [
  ["u1", "Lena Hartmann"],
  ["u2", "Deniz Aydın"],
  ["u3", "Marco Rossi"],
  ["u4", "Sophie Klein"],
] as const;

const PRODUCTS = [
  ["Mobilfunk", "GigaMobil M", 90],
  ["Mobilfunk", "GigaMobil L", 120],
  ["Festnetz", "GigaZuhause 250", 140],
  ["Kabel", "GigaZuhause Kabel 1000", 160],
  ["Strom", "Ökostrom Fix 24", 45],
  ["Gas", "Gas Fix 24", 40],
  ["Solar_PV", "PV-Lead", 80],
] as const;

/** Tage zurück je Tür: heute, diese Woche, diesen Monat, älter. */
const AGE = [0, 0, 1, 2, 3, 5, 0, 9, 12, 16, 0, 4, 21, 1];

export const demoDoors = (): RawRecord[] =>
  DOORS.map(([name, street, houseNumber, city], i) => ({ id: `d${i + 1}`, name, street, houseNumber, city, zipCode: city === "Köln" ? "50667" : city === "Bonn" ? "53111" : city === "Düsseldorf" ? "40210" : "51373" }));

export function demoProducts(now: Date): RawRecord[] {
  return DOORS.flatMap((_, i) => {
    const [userId, userName] = SELLERS[i % SELLERS.length]!;
    const count = i % 4 === 1 ? 3 : i % 3 === 0 ? 2 : 1;
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (AGE[i] ?? 0), 10 + (i % 7), (i * 13) % 60);
    return Array.from({ length: count }, (_, k) => {
      const [category, type, euro] = PRODUCTS[(i + k * 2) % PRODUCTS.length]!;
      const upsell = i === 4 && k === 0 ? { upsellGrade: 2, upsellOldPrice: 29.99, upsellNewPrice: 44.99, upsellDiff: 15 } : {};
      return {
        id: `p${i + 1}-${k + 1}`,
        doorId: `d${i + 1}`,
        userId,
        userName,
        category,
        type,
        quantity: 1,
        commissionEuro: euro,
        timestamp: new Date(at.getTime() + k * 60_000).toISOString(),
        notes: i === 5 && k === 0 ? "[STORNIERT] Kunde hat widerrufen" : i === 9 ? "[ABGESCHLOSSEN]" : undefined,
        ...upsell,
      };
    });
  });
}
