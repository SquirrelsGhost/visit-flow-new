import type { RawContract } from "./expiringLogic";

/** Kunde, Straße, Nr, PLZ, Ort, Kategorie, Tarif, Provision, Tage bis Ablauf, Verkäufer, Lead, Berater */
type DemoRow = readonly [string, string, string, string, string, string, string, number, number, number, boolean, string?];

const SELLERS = [
  ["u1", "Lena Hartmann"],
  ["u2", "Deniz Aydın"],
  ["u3", "Marco Rossi"],
  ["u4", "Sophie Klein"],
] as const;

/** Beispiel-Berater für Zuweisungen (Ids aus dem Demo-Verzeichnis). */
const ADVISORS: Record<string, string> = { b1: "Lukas Berger", b2: "Sarah Klein" };

const ROWS: readonly DemoRow[] = [
  ["Familie Krüger", "Lindenallee", "12", "50667", "Köln", "kabel-neu", "GigaZuhause Kabel 1000", 160, 3, 0, true],
  ["Bäckerei Sommer", "Hauptstraße", "3", "50667", "Köln", "dsl", "GigaZuhause DSL 100", 120, 6, 1, false],
  ["Weber, Anna", "Am Stadtpark", "7a", "53111", "Bonn", "mobil", "GigaMobil L", 120, 9, 2, true, "b1"],
  ["Praxis Dr. Lang", "Goethestraße", "45", "40210", "Düsseldorf", "glasfaser", "GigaZuhause Glasfaser 500", 180, 14, 3, false],
  ["Yilmaz, Mehmet", "Rheinufer", "21", "53111", "Bonn", "tv", "GigaTV Premium", 60, 19, 0, true],
  ["Hoffmann GmbH", "Industriestraße", "88", "50667", "Köln", "kabel-bestand", "Kabel Upgrade 500", 90, 26, 1, false],
  ["Nowak, Ewa", "Kirchplatz", "5", "53111", "Bonn", "mobil", "GigaMobil M", 90, 33, 2, false],
  ["Becker, Jonas", "Ahornweg", "14", "40210", "Düsseldorf", "kabel-neu", "GigaZuhause Kabel 250", 140, 38, 3, true],
  ["Café Linde", "Marktstraße", "1", "50667", "Köln", "router", "FritzBox 6690", 25, 41, 0, false],
  ["Fischer, Tim", "Brunnenweg", "30", "51373", "Leverkusen", "dsl", "GigaZuhause DSL 250", 140, 47, 1, true, "b2"],
  ["Autohaus Kaya", "Ringstraße", "120", "40210", "Düsseldorf", "glasfaser", "Business Glasfaser 1000", 220, 52, 2, false],
  ["Schmitt, Paul", "Bergweg", "2", "51373", "Leverkusen", "mobil", "GigaMobil XL", 150, 58, 3, false],
  ["Richter, Lea", "Wiesenstraße", "9", "50667", "Köln", "kabel-bestand", "Kabel Upgrade 1000", 110, 63, 0, true],
  ["Zahnarzt Vogel", "Poststraße", "17", "53111", "Bonn", "glasfaser", "GigaZuhause Glasfaser 1000", 200, 69, 1, false],
  ["Kaiser, Mia", "Lindenstraße", "4", "40210", "Düsseldorf", "tv", "GigaTV Basic", 40, 74, 2, false],
  ["Blumen Engel", "Domplatz", "8", "50667", "Köln", "mobil", "GigaMobil M", 90, 80, 3, true],
  ["Wagner, Ole", "Feldweg", "11", "51373", "Leverkusen", "kabel-neu", "GigaZuhause Kabel 500", 150, 86, 0, false],
];

const atNoon = (now: Date, days: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 12);

/** Beispielverträge im Format von v1 /products/admin/expiring; Ablauf relativ zu heute, Start zwei Jahre davor. */
export function demoContracts(now: Date): RawContract[] {
  return ROWS.map(([name, street, nr, zip, city, category, type, euro, days, seller, isLead, advisor], i) => {
    const expiry = atNoon(now, days);
    const start = new Date(expiry);
    start.setFullYear(start.getFullYear() - 2);
    const [userId, userName] = SELLERS[seller % SELLERS.length]!;
    return {
      id: `x${i + 1}`,
      doorId: `xd${i + 1}`,
      category,
      type,
      quantity: 1,
      userId,
      userName,
      contractStartDate: start.toISOString(),
      contractExpiryDate: expiry.toISOString(),
      isLead,
      assignedAdvisor: advisor,
      assignedAdvisorName: advisor ? ADVISORS[advisor] : undefined,
      leadAssignedAt: advisor ? atNoon(now, -2).toISOString() : undefined,
      customerName: name,
      address: `${street} ${nr}, ${zip} ${city}`,
      commissionEuro: euro,
    };
  });
}
