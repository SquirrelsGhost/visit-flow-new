import { localDay } from "../overview/todayStats";
import type { TeamUser } from "../overview/teamTypes";
import { can } from "../permissions";
import type { PendingDoor, RawDoor, RawProduct, StreetData } from "./streetTypes";

/** Beispielstraßen rund um Düsseldorf; jede Person läuft zwei davon (fest nach Index). */
const STREETS: readonly [street: string, zipCode: string, city: string][] = [
  ["Graf-Adolf-Straße", "40210", "Düsseldorf"],
  ["Immermannstraße", "40210", "Düsseldorf"],
  ["Oststraße", "40210", "Düsseldorf"],
  ["Nordstraße", "40477", "Düsseldorf"],
  ["Collenbachstraße", "40476", "Düsseldorf"],
  ["Krefelder Straße", "41460", "Neuss"],
  ["Büttger Straße", "41460", "Neuss"],
  ["Bahnstraße", "40699", "Erkrath"],
  ["Hochdahler Straße", "40699", "Erkrath"],
  ["Kölner Landstraße", "40591", "Düsseldorf"],
];
const STATUS = ["N/A", "Angetroffen → Kein Interesse", "N/A", "Angetroffen → Termin", "Angetroffen → Sale", "N/A", "Angetroffen → Versorgt", "Angetroffen → Kein Interesse", "Angetroffen → Sale"];
const RESIDENTS = ["Schneider", "Weber", "Meyer", "Wagner", "Koch", "Bauer", "Richter", "Klein", "Schulz", "Krämer", "Lehmann", "Peters"];
/** Produkte mit der Provision, die v1 beim Verkauf speichert (Euro). */
const PRODUCTS: readonly [category: string, euro: number][] = [
  ["KIP", 60],
  ["KAS", 45],
  ["GigaTV", 25],
  ["Mobile", 30],
  ["Glasfaser", 80],
  ["Upsell", 15],
];

function at(daysAgo: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9, 0, 0, 0);
  d.setMinutes(minute);
  return new Date(Math.min(d.getTime(), Date.now() - 60_000)).toISOString();
}

/**
 * Türen und Verkäufe der letzten drei Wochen für die Demo: je Person zwei feste Straßen, an Werktagen
 * 3–6 Türen, ab und zu ein Mehrfamilienhaus mit mehreren Parteien, Verkäufe mit Produkten.
 */
export function demoStreetData(users: readonly TeamUser[]): StreetData {
  const doors: RawDoor[] = [];
  const products: RawProduct[] = [];
  const nextNumber = new Map<string, number>();
  users.forEach((user, u) => {
    if (can(user, "admin:*") || user.isActive === false) return;
    for (let day = 0; day < 21; day += 1) {
      if ((day + u) % 7 === 5) continue;
      const count = 3 + ((u + day) % 4);
      for (let k = 0; k < count; k += 1) {
        const [street, zipCode, city] = STREETS[(u * 2 + (k % 2)) % STREETS.length] ?? STREETS[0]!;
        const key = `${zipCode}|${street}`;
        const mfh = (u + day + k) % 5 === 0;
        const number = (nextNumber.get(key) ?? 0) + (mfh || k % 3 !== 2 ? 1 : 2);
        nextNumber.set(key, number);
        const parties = mfh ? 2 + ((u + k) % 3) : 1;
        for (let p = 0; p < parties; p += 1) {
          const id = `sd-${user.id}-${day}-${k}-${p}`;
          const status = STATUS[(u + day * 3 + k + p) % STATUS.length] ?? "N/A";
          const timestamp = at(day, k * 25 + p * 4 + u * 3);
          const resident = RESIDENTS[(u + day + k + p) % RESIDENTS.length] ?? "";
          doors.push({ id, street, houseNumber: String(number), zipCode, city, status, userId: user.id, customerName: mfh || k % 2 === 0 ? resident : "", timestamp });
          if (!status.includes("Sale")) continue;
          const [category, euro] = PRODUCTS[(u + day + k) % PRODUCTS.length] ?? PRODUCTS[0]!;
          products.push({ doorId: id, userId: user.id, category, quantity: 1, timestamp, commissionEuro: euro });
          if ((day + k) % 3 === 0) products.push({ doorId: id, userId: user.id, category: "Mobile", quantity: 1, timestamp, commissionEuro: 30 });
        }
      }
    }
  });
  return { doors, products };
}

/** Zwei Lösch-Anfragen und eine verwaiste Tür ohne Hausnummer für die Demo. */
export function demoPendingDoors(): PendingDoor[] {
  const today = localDay(new Date());
  return [
    { id: "pd-1", name: "Schneider", street: "Oststraße", houseNumber: "14", zipCode: "40210", city: "Düsseldorf", status: "Angetroffen → Kein Interesse", ownerName: "Lukas Berger", requestedByName: "Lukas Berger", requestedAt: `${today}T08:42:00` },
    { id: "pd-2", name: "", street: "Krefelder Straße", houseNumber: "7", zipCode: "41460", city: "Neuss", status: "N/A", ownerName: "Sarah Klein", requestedByName: "Sarah Klein", requestedAt: `${today}T10:15:00` },
    { id: "pd-3", name: "", street: "Bahnstraße", houseNumber: "", zipCode: "40699", city: "Erkrath", status: "Angetroffen → Termin", ownerName: "Tim Hoffmann", requestedByName: "Unbekannt", requestedAt: "" },
  ];
}
