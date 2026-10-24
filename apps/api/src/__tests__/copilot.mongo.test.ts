import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { coachMemoryModel } from "../modules/copilot/CoachMemory.model";
import { mongoCoachMemoryRepository } from "../modules/copilot/CoachMemoryRepository";
import { copilotLogModel } from "../modules/copilot/CopilotLog.model";
import { mongoCopilotLogRepository } from "../modules/copilot/CopilotLogRepository";

/** Wie consent.mongo.test: nur mit MONGO_TEST_URI. Prüft Verschlüsselung, Besitz und TTL-Indizes. */
const uri = process.env.MONGO_TEST_URI;
const KEY = "k".repeat(40);
const LOG_DAYS = 90;
const userId = "64b000000000000000000001";

describe.skipIf(!uri)("Enes-Daten in MongoDB", () => {
  const memoryModel = coachMemoryModel();
  const logModel = copilotLogModel(LOG_DAYS);
  const memories = mongoCoachMemoryRepository(memoryModel, KEY, 180);
  const logs = mongoCopilotLogRepository(logModel, KEY);

  beforeAll(async () => {
    await mongoose.connect(uri ?? "");
    await Promise.all([memoryModel.deleteMany({}), logModel.deleteMany({})]);
    await Promise.all([memoryModel.syncIndexes(), logModel.syncIndexes()]);
  });

  afterAll(async () => {
    await mongoose.connection.dropCollection("coachmemories").catch(() => undefined);
    await mongoose.connection.dropCollection("copilotlogs").catch(() => undefined);
    await mongoose.disconnect();
  });

  it("speichert Erinnerungen verschlüsselt und nur für den Besitzer löschbar", async () => {
    const saved = await memories.add(userId, "preference", "Läuft lieber abends", "user");
    const raw = await memoryModel.collection.findOne({ userId });
    expect(JSON.stringify(raw)).not.toContain("abends");
    expect(await memories.list(userId, 10)).toEqual([saved]);
    expect(await memories.remove("64b000000000000000000002", saved.id)).toBe(false);
    expect(await memories.remove(userId, saved.id)).toBe(true);
  });

  it("protokolliert verschlüsselt und liefert 👍-Beispiele je Sparte", async () => {
    const id = await logs.insert(userId, "telco", { question: "Einwand Preis?", reply: "Rechne vor." });
    expect(JSON.stringify(await logModel.collection.findOne({ userId }))).not.toContain("Rechne");
    expect(await logs.setFeedback(userId, id, "up")).toBe(true);
    expect(await logs.liked(userId, "telco", 3)).toEqual([{ question: "Einwand Preis?", reply: "Rechne vor." }]);
    expect(await logs.liked(userId, "energy", 3)).toEqual([]);
  });

  it("legt die Löschfristen als TTL-Index an", async () => {
    const memoryTtl = (await memoryModel.collection.indexes()).find((index) => index.key.expiresAt === 1);
    const logTtl = (await logModel.collection.indexes()).find((index) => index.key.createdAt === 1);
    expect(memoryTtl?.expireAfterSeconds).toBe(0);
    expect(logTtl?.expireAfterSeconds).toBe(LOG_DAYS * 24 * 60 * 60);
  });
});
