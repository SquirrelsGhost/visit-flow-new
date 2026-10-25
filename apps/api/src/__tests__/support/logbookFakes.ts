import type { LogbookTripDto } from "@visit-flow/shared/logbookSchema";
import type { LogbookMonthDoc, LogbookProfileDoc } from "../../modules/logbook/Logbook.model";
import type { LogbookRepository } from "../../modules/logbook/LogbookRepository";

export const CIPHER_KEY = "k".repeat(40);

/** Wie die Mongo-Variante: Schreiben nur, wenn `baseRev` dem gespeicherten Stand entspricht. */
export function memoryLogbook(): LogbookRepository & { months: LogbookMonthDoc[]; profiles: LogbookProfileDoc[] } {
  const months: LogbookMonthDoc[] = [];
  const profiles: LogbookProfileDoc[] = [];
  function save<T extends { rev: number }>(rows: T[], index: number, baseRev: number, doc: T): T | null {
    const current = index >= 0 ? rows[index] : undefined;
    if ((current?.rev ?? 0) !== baseRev) return null;
    if (current) rows[index] = doc;
    else rows.push(doc);
    return doc;
  }
  return {
    months,
    profiles,
    findMonth: async (userId, month) => months.find((m) => m.userId === userId && m.month === month) ?? null,
    listMonths: async (userId, since) => months.filter((m) => m.userId === userId && (!since || m.updatedAt > since)),
    saveMonth: async ({ baseRev, doc }) =>
      save(months, months.findIndex((m) => m.userId === doc.userId && m.month === doc.month), baseRev, doc),
    findProfile: async (userId) => profiles.find((p) => p.userId === userId) ?? null,
    saveProfile: async ({ baseRev, doc }) => save(profiles, profiles.findIndex((p) => p.userId === doc.userId), baseRev, doc),
    async deleteForUser(userId) {
      const before = months.length + profiles.length;
      months.splice(0, months.length, ...months.filter((m) => m.userId !== userId));
      profiles.splice(0, profiles.length, ...profiles.filter((p) => p.userId !== userId));
      return before - months.length - profiles.length;
    },
  };
}

export function makeTrip(overrides: Partial<LogbookTripDto> = {}): LogbookTripDto {
  return {
    id: "t1",
    date: "2026-10-05",
    startTime: "09:00",
    endTime: "10:00",
    startKm: 1000,
    endKm: 1042,
    kind: "business",
    from: "Büro",
    to: "Musterstadt, Lindenweg",
    purpose: "Haustürberatung",
    partner: "Haushalte Lindenweg",
    detour: "",
    vehicleId: "car-1",
    driver: "Bea Berater",
    source: "manual",
    createdAt: "2026-10-05T10:05:00.000Z",
    revisions: [],
    ...overrides,
  };
}
