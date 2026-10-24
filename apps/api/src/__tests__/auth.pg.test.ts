import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../config/env";
import { newObjectId } from "../lib/db/objectId";
import { auditLogs } from "../modules/audit/AuditLog.model";
import { loginFailures } from "../modules/auth/LoginFailure.model";
import { refreshTokens } from "../modules/auth/RefreshToken.model";
import { users } from "../modules/users/User.model";
import { createServices, type Services } from "../services";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";

/**
 * Gegen ein echtes PostgreSQL. Ein aus v1 übernommener Nutzer (bcryptjs-Hash mit $2a$, alte
 * ObjectId als ID) meldet sich an, Refresh-Tokens rotieren in ihrer Kette, Fehlversuche und
 * Audit-Einträge landen in ihren Tabellen.
 */
const PASSWORD = "v1-passwort";
const userId = newObjectId();
const client = { ip: "198.51.100.7", userAgent: "vitest" };

describe.skipIf(!TEST_DATABASE_URL)("Auth gegen PostgreSQL", () => {
  let database: TestDatabase;
  let services: Services;

  beforeAll(async () => {
    database = await createTestDatabase();
    const env = loadEnv({ DATABASE_URL: TEST_DATABASE_URL, JWT_SECRET: "j".repeat(40), DATA_CIPHER_KEY: "d".repeat(40), BLIND_INDEX_KEY: "b".repeat(40) });
    services = createServices(env, database.db, database.ping);
    await database.db.insert(users).values({
      id: userId, email: "v1@example.de", passwordHash: bcrypt.hashSync(PASSWORD, 4).replace(/^\$2b\$/, "$2a$"),
      name: "V1 Nutzer", role: "teamleiter", isWhitelisted: true, whitelistStatus: "approved", loginAttempts: 3,
      profile: { dailyPins: [{ street: "Hauptstr." }], billingCity: "Köln" },
    });
  });

  afterAll(async () => database?.drop());

  it("meldet einen v1-Nutzer an und liefert die Profilfelder aus profile", async () => {
    const result = await services.auth.login({ email: "v1@example.de", password: PASSWORD }, client);
    expect(result.user).toMatchObject({ id: userId, role: "teamleiter", billingCity: "Köln", dailyPins: [{ street: "Hauptstr." }] });
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.showTeamLeiterLiveTracking).toBe(true);

    const tokens = await database.db.select().from(refreshTokens).where(eq(refreshTokens.userId, userId));
    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("setzt nur die Login-Felder am Nutzer", async () => {
    const [user] = await database.db.select().from(users).where(eq(users.id, userId));
    expect(user).toMatchObject({ loginAttempts: 0, name: "V1 Nutzer", profile: { billingCity: "Köln" } });
    expect(user?.lastActivity).toBeInstanceOf(Date);
    expect(user?.passwordHash).toMatch(/^\$2a\$/);
  });

  it("rotiert innerhalb derselben Kette und sperrt sie bei Wiederverwendung", async () => {
    const login = await services.auth.login({ email: "v1@example.de", password: PASSWORD }, client);
    const next = await services.auth.refresh(login.refreshToken, client);
    expect(next.refreshToken).not.toBe(login.refreshToken);
    await expect(services.auth.refresh(login.refreshToken, client)).rejects.toThrow();
    // Die ganze Kette ist gesperrt, auch das gerade erst ausgegebene Token
    await expect(services.auth.refresh(next.refreshToken, client)).rejects.toThrow();
    const reused = await database.db.select().from(auditLogs).where(eq(auditLogs.action, "REFRESH_TOKEN_REUSED"));
    expect(reused).toHaveLength(2);
  });

  it("lässt gleichzeitige Refreshes mit demselben Token nur einmal durch", async () => {
    const login = await services.auth.login({ email: "v1@example.de", password: PASSWORD }, client);
    const results = await Promise.allSettled([services.auth.refresh(login.refreshToken, client), services.auth.refresh(login.refreshToken, client)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });

  it("speichert Fehlversuche nur gehasht und schreibt Audit-Einträge", async () => {
    await expect(services.auth.login({ email: "v1@example.de", password: "falsch" }, client)).rejects.toThrow();
    const failures = await database.db.select().from(loginFailures);
    expect(failures).toHaveLength(2);
    expect(JSON.stringify(failures)).not.toMatch(/198\.51|v1@example/);
    const [entry] = await database.db.select().from(auditLogs).where(eq(auditLogs.action, "LOGIN_FAILED"));
    expect(entry).toMatchObject({ category: "SECURITY", actorUserId: userId, actorEmail: "v1@example.de", actorIp: client.ip });
  });

  it("findet E-Mails unabhängig von Großschreibung, weil nur Kleinbuchstaben gespeichert werden", async () => {
    await expect(database.db.insert(users).values({ id: newObjectId(), email: "Gross@Example.de", name: "X" })).rejects.toThrow();
  });

  it("löscht Sitzungen über die Datenschutz-Registry", async () => {
    const outcome = await services.privacy.deleteUser(userId);
    expect(outcome.sessions).toMatchObject({ action: "deleted" });
    expect(await database.db.select().from(refreshTokens).where(eq(refreshTokens.userId, userId))).toHaveLength(0);
  });

  it("meldet die Datenbank im Health-Check", async () => {
    expect(await database.ping()).toBe(true);
  });
});
