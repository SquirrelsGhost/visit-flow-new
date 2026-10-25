import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { newId } from "../lib/db/ids";
import { logbookMonths } from "../modules/logbook/Logbook.model";
import { pgLogbookRepository } from "../modules/logbook/LogbookRepository";
import { LogbookService } from "../modules/logbook/LogbookService";
import { users } from "../modules/users/User.model";
import { CIPHER_KEY, makeTrip } from "./support/logbookFakes";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";

describe.skipIf(!TEST_DATABASE_URL)("Fahrtenbuch in PostgreSQL", () => {
  let database: TestDatabase;
  let service: LogbookService;
  const bea = newId();
  const tom = newId();

  beforeAll(async () => {
    database = await createTestDatabase();
    service = new LogbookService(pgLogbookRepository(database.db), CIPHER_KEY);
    await database.db.insert(users).values([
      { id: bea, email: "bea@example.de", name: "Bea", role: "berater" },
      { id: tom, email: "tom@example.de", name: "Tom", role: "berater" },
    ]);
  });

  afterAll(async () => database?.drop());

  it("speichert verschlüsselt und erkennt veraltete Stände", async () => {
    expect((await service.saveMonth(bea, "2026-10", { baseRev: 0, trips: [makeTrip()], lock: null })).rev).toBe(1);
    expect((await service.saveMonth(bea, "2026-10", { baseRev: 1, trips: [makeTrip()], lock: null })).rev).toBe(2);
    await expect(service.saveMonth(bea, "2026-10", { baseRev: 1, trips: [], lock: null })).rejects.toMatchObject({ status: 409 });
    const [raw] = await database.db.select().from(logbookMonths).where(eq(logbookMonths.userId, bea));
    expect(JSON.stringify(raw)).not.toContain("Lindenweg");
    expect((await service.get(bea)).months[0]?.trips[0]?.partner).toBe("Haushalte Lindenweg");
  });

  it("legt bei gleichzeitigem ersten Speichern nur einen Datensatz an", async () => {
    const input = { baseRev: 0, trips: [], lock: null };
    const results = await Promise.allSettled([service.saveMonth(tom, "2026-09", input), service.saveMonth(tom, "2026-09", input)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await database.db.$count(logbookMonths, eq(logbookMonths.userId, tom))).toBe(1);
  });

  it("liefert mit since nur später geänderte Monate", async () => {
    const later = new Date(Date.now() + 60_000);
    expect((await service.get(bea, later)).months).toHaveLength(0);
  });

  it("lehnt ungültige Monate in der Datenbank ab", async () => {
    const payload = { sealed: 1 as const, iv: "a", tag: "b", data: "c" };
    await expect(database.db.insert(logbookMonths).values({ userId: bea, month: "2026-13", payload, rev: 1, updatedAt: new Date() })).rejects.toThrow();
  });

  it("speichert Fahrzeuge und löscht alles zum Nutzer, auch über das Konto", async () => {
    await service.saveProfile(bea, { baseRev: 0, vehicles: [{ id: "car-1", name: "Golf", plate: "" }], activeVehicleId: "car-1", importedV1: false });
    expect((await service.get(bea)).profile).toMatchObject({ rev: 1, vehicles: [{ name: "Golf" }] });
    expect(await service.deleteUser(bea)).toBe(2);
    await database.db.delete(users).where(eq(users.id, tom));
    expect(await database.db.$count(logbookMonths)).toBe(0);
  });
});
