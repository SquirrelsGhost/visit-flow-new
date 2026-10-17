import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CONSENT_VERSION } from "@visit-flow/shared/consent";
import { consentLogModel } from "../modules/consent/ConsentLog.model";
import { mongoConsentRepository } from "../modules/consent/ConsentRepository";
import { ConsentService } from "../modules/consent/ConsentService";

/**
 * Läuft gegen eine echte MongoDB, wenn MONGO_TEST_URI gesetzt ist (in der CI ein mongo-Service-Container).
 * Prüft, dass v2 schreiben und lesen kann und die Löschfrist als TTL-Index in der Datenbank liegt.
 */
const uri = process.env.MONGO_TEST_URI;
const RETENTION_DAYS = 1095;

describe.skipIf(!uri)("Consent-Protokoll in MongoDB", () => {
  const model = consentLogModel(RETENTION_DAYS);
  const service = new ConsentService(mongoConsentRepository(model));

  beforeAll(async () => {
    await mongoose.connect(uri ?? "");
    await model.deleteMany({});
    await model.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.connection.dropCollection("consentlogs").catch(() => undefined);
    await mongoose.disconnect();
  });

  it("schreibt und liest Einträge", async () => {
    await service.record({ id: "mongo-test-1", v: CONSENT_VERSION, choice: { extern: true }, source: "banner" });
    const history = await service.history("mongo-test-1");
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ consentId: "mongo-test-1", version: CONSENT_VERSION, choice: { extern: true } });
  });

  it("legt den TTL-Index mit 3 Jahren an", async () => {
    const indexes = await model.collection.indexes();
    const ttl = indexes.find((index) => index.key.receivedAt === 1);
    expect(ttl?.expireAfterSeconds).toBe(RETENTION_DAYS * 24 * 60 * 60);
  });

  it("speichert weder IP noch User-Agent noch userId", async () => {
    const raw = await model.collection.findOne({ consentId: "mongo-test-1" });
    expect(Object.keys(raw ?? {}).sort()).toEqual(["_id", "choice", "consentId", "receivedAt", "source", "version"]);
  });
});
