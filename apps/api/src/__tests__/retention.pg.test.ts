import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { purgeExpired } from "../lib/db/retention";
import { newObjectId } from "../lib/db/objectId";
import { auditLogs } from "../modules/audit/AuditLog.model";
import { auditRetention } from "../modules/audit/auditRetention";
import { authRetention } from "../modules/auth/authRetention";
import { loginFailures } from "../modules/auth/LoginFailure.model";
import { refreshTokens } from "../modules/auth/RefreshToken.model";
import { consentLogs } from "../modules/consent/ConsentLog.model";
import { consentRetention } from "../modules/consent/consentRetention";
import { users } from "../modules/users/User.model";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";

const now = new Date("2026-10-24T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);
const MIN = 60_000;
const DAY = 24 * 60 * MIN;

describe.skipIf(!TEST_DATABASE_URL)("Löschfristen in PostgreSQL", () => {
  let database: TestDatabase;
  const rules = [...authRetention, auditRetention, consentRetention(1095)];

  beforeAll(async () => {
    database = await createTestDatabase();
    const userId = newObjectId();
    await database.db.insert(users).values({ id: userId, email: "r@example.de", name: "R" });
    await database.db.insert(loginFailures).values([{ key: "alt", at: ago(16 * MIN) }, { key: "neu", at: ago(5 * MIN) }]);
    await database.db.insert(refreshTokens).values([
      { tokenHash: "a".repeat(64), userId, familyId: "f", createdAt: ago(8 * DAY), expiresAt: ago(DAY) },
      { tokenHash: "b".repeat(64), userId, familyId: "f", createdAt: ago(DAY), expiresAt: new Date(now.getTime() + DAY) },
    ]);
    await database.db.insert(auditLogs).values([
      { action: "LOGIN_SUCCESS", category: "SECURITY", timestamp: ago(91 * DAY) },
      { action: "LOGIN_SUCCESS", category: "SECURITY", timestamp: ago(89 * DAY) },
    ]);
    await database.db.insert(consentLogs).values([
      { consentId: "alt", version: 1, choice: { extern: true }, source: "banner", receivedAt: ago(1096 * DAY) },
      { consentId: "neu", version: 1, choice: { extern: true }, source: "banner", receivedAt: ago(10 * DAY) },
    ]);
  });

  afterAll(async () => database?.drop());

  it("löscht genau die Zeilen außerhalb der Fristen", async () => {
    const deleted = await purgeExpired(database.db, rules, now);
    expect(deleted).toEqual({ login_failures: 1, refresh_tokens: 1, audit_logs: 1, consent_logs: 1 });
    expect((await database.db.select().from(consentLogs)).map((row) => row.consentId)).toEqual(["neu"]);
  });

  it("räumt nur in einer Instanz gleichzeitig auf", async () => {
    const results = await Promise.all([purgeExpired(database.db, rules, now), purgeExpired(database.db, rules, now)]);
    expect(results.filter((result) => result === null).length).toBeLessThanOrEqual(1);
    expect(results.some((result) => result !== null)).toBe(true);
  });
});
