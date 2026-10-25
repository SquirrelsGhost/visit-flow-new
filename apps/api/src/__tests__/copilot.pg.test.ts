import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isUuid, newId } from "../lib/db/ids";
import { purgeExpired } from "../lib/db/retention";
import { coachMemories } from "../modules/copilot/CoachMemory.model";
import { pgCoachMemoryRepository } from "../modules/copilot/CoachMemoryRepository";
import { copilotLogs } from "../modules/copilot/CopilotLog.model";
import { pgCopilotLogRepository } from "../modules/copilot/CopilotLogRepository";
import { copilotRetention } from "../modules/copilot/copilotRetention";
import { users } from "../modules/users/User.model";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";

/** Prüft Verschlüsselung, Besitz, Fremdschlüssel und Löschfristen gegen echtes PostgreSQL. */
const KEY = "k".repeat(40);
const DAY = 24 * 60 * 60 * 1000;

describe.skipIf(!TEST_DATABASE_URL)("Enes-Daten in PostgreSQL", () => {
  let database: TestDatabase;
  const userId = newId();
  const otherId = newId();

  beforeAll(async () => {
    database = await createTestDatabase();
    await database.db.insert(users).values([
      { id: userId, email: "enes@example.de", name: "Bea" },
      { id: otherId, email: "andere@example.de", name: "Cem" },
    ]);
  });

  afterAll(async () => database?.drop());

  it("speichert Erinnerungen verschlüsselt und nur für den Besitzer löschbar", async () => {
    const memories = pgCoachMemoryRepository(database.db, KEY, 180);
    const saved = await memories.add(userId, "preference", "Läuft lieber abends", "user");
    expect(saved).toMatchObject({ kind: "preference", content: "Läuft lieber abends", source: "user" });
    expect(isUuid(saved.id)).toBe(true);
    const raw = await database.db.select().from(coachMemories);
    expect(JSON.stringify(raw)).not.toContain("abends");
    expect(await memories.list(userId, 10)).toEqual([saved]);
    expect(await memories.remove(otherId, saved.id)).toBe(false);
    expect(await memories.remove(userId, saved.id)).toBe(true);
    expect(await memories.list(userId, 10)).toEqual([]);
  });

  it("protokolliert verschlüsselt und liefert 👍-Beispiele je Sparte", async () => {
    const logs = pgCopilotLogRepository(database.db, KEY);
    const id = await logs.insert(userId, "telco", { question: "Einwand Preis?", reply: "Rechne vor." });
    expect(JSON.stringify(await database.db.select().from(copilotLogs))).not.toContain("Rechne");
    expect(await logs.setFeedback(otherId, id, "up")).toBe(false);
    expect(await logs.setFeedback(userId, id, "up", "passt")).toBe(true);
    expect(await logs.liked(userId, "telco", 3)).toEqual([{ question: "Einwand Preis?", reply: "Rechne vor." }]);
    expect(await logs.liked(userId, "energy", 3)).toEqual([]);
    expect(await logs.exportForUser(userId)).toEqual([expect.objectContaining({ question: "Einwand Preis?", feedback: "up" })]);
    expect(await logs.deleteForUser(userId)).toBe(1);
  });

  it("lehnt unbekannte Arten und Bewertungen in der Datenbank ab", async () => {
    const base = { id: newId(), userId, content: { sealed: 1 as const, iv: "", tag: "", data: "" }, expiresAt: new Date() };
    await expect(database.db.insert(coachMemories).values({ ...base, kind: "hack" as "fact", source: "user" })).rejects.toThrow();
    await expect(database.db.insert(copilotLogs).values({ id: newId(), userId, vertical: "telco", question: base.content, reply: base.content, feedback: "meh" as "up" })).rejects.toThrow();
  });

  it("löscht Abgelaufenes über den Aufräum-Job und alles mit dem Konto", async () => {
    const now = new Date();
    const sealed = { sealed: 1 as const, iv: "", tag: "", data: "" };
    await database.db.insert(coachMemories).values([
      { id: newId(), userId, kind: "fact", source: "enes", content: sealed, expiresAt: new Date(now.getTime() - DAY) },
      { id: newId(), userId, kind: "fact", source: "enes", content: sealed, expiresAt: new Date(now.getTime() + DAY) },
    ]);
    await database.db.insert(copilotLogs).values([
      { id: newId(), userId, vertical: "telco", question: sealed, reply: sealed, createdAt: new Date(now.getTime() - 91 * DAY) },
      { id: newId(), userId, vertical: "telco", question: sealed, reply: sealed, createdAt: new Date(now.getTime() - DAY) },
    ]);
    expect(await purgeExpired(database.db, copilotRetention(90), now)).toEqual({ coach_memories: 1, copilot_logs: 1 });
    await database.db.delete(users).where(eq(users.id, userId));
    expect(await database.db.select().from(coachMemories)).toEqual([]);
    expect(await database.db.select().from(copilotLogs)).toEqual([]);
  });
});
