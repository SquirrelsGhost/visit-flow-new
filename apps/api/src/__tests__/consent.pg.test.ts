import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CONSENT_VERSION } from "@visit-flow/shared/consent";
import { consentLogs } from "../modules/consent/ConsentLog.model";
import { pgConsentRepository } from "../modules/consent/ConsentRepository";
import { ConsentService } from "../modules/consent/ConsentService";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";

describe.skipIf(!TEST_DATABASE_URL)("Consent-Protokoll in PostgreSQL", () => {
  let database: TestDatabase;
  let service: ConsentService;

  beforeAll(async () => {
    database = await createTestDatabase();
    service = new ConsentService(pgConsentRepository(database.db));
  });

  afterAll(async () => database?.drop());

  it("schreibt und liest Einträge, neueste zuerst", async () => {
    await service.record({ id: "pg-test-1", v: CONSENT_VERSION, choice: { extern: false }, source: "banner" }, new Date("2026-10-01"));
    await service.record({ id: "pg-test-1", v: CONSENT_VERSION, choice: { extern: true }, source: "einstellungen" }, new Date("2026-10-02"));
    const history = await service.history("pg-test-1");
    expect(history.map((entry) => entry.choice.extern)).toEqual([true, false]);
    expect(history[0]).toMatchObject({ consentId: "pg-test-1", version: CONSENT_VERSION, receivedAt: "2026-10-02T00:00:00.000Z" });
  });

  it("speichert weder IP noch User-Agent noch userId", async () => {
    const [raw] = await database.db.select().from(consentLogs).limit(1);
    expect(Object.keys(raw ?? {}).sort()).toEqual(["choice", "consentId", "id", "receivedAt", "source", "version"]);
  });

  it("lehnt unbekannte Quellen in der Datenbank ab", async () => {
    await expect(
      database.db.insert(consentLogs).values({ consentId: "x", version: 1, choice: { extern: true }, source: "hack" as "banner" }),
    ).rejects.toThrow();
  });
});
