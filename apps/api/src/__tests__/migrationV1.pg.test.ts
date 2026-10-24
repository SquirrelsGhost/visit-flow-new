import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../config/env";
import { migrateV1 } from "../migration/v1/migrateV1";
import { refreshTokens } from "../modules/auth/RefreshToken.model";
import { areaTeams } from "../modules/teams/Area.model";
import { teamMembers } from "../modules/teams/Team.model";
import { users } from "../modules/users/User.model";
import { createServices } from "../services";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";
import { NOW, V1_PASSWORD, V1_RAW_REFRESH, v1Fixture } from "./support/v1Fixture";

describe.skipIf(!TEST_DATABASE_URL)("Übernahme aus v1 nach PostgreSQL", () => {
  let database: TestDatabase;
  const fixture = v1Fixture();
  const userCount = async () => (await database.db.select({ n: count() }).from(users))[0]?.n;

  beforeAll(async () => {
    database = await createTestDatabase();
  });
  afterAll(async () => database?.drop());

  it("ändert im Trockenlauf nichts", async () => {
    const report = await migrateV1(database.db, fixture.source, { dryRun: true, reset: false, now: NOW });
    expect(report.counts.users).toBe(3);
    expect(await userCount()).toBe(0);
  });

  it("übernimmt Nutzer, Teams, Gebiete, Abos und laufende Sitzungen", async () => {
    const report = await migrateV1(database.db, fixture.source, { dryRun: false, reset: false, now: NOW });
    expect(report.counts).toMatchObject({ users: 3, teams: 1, team_members: 1, areas: 1, area_teams: 1, subscriptions: 1, system_settings: 1, refresh_tokens: 1 });
    expect(Object.keys(report.warnings)).toEqual(expect.arrayContaining([
      "Nutzer ohne ID oder E-Mail übersprungen", "Unbekannte Rolle, als berater übernommen",
      "Doppelte E-Mail, älteres Konto übersprungen", "Verweis auf fehlende(n) Mentor entfernt",
    ]));
    expect(JSON.stringify(report.summary())).not.toMatch(/@example/);

    const [berater] = await database.db.select().from(users).where(eq(users.id, String(fixture.id.berater)));
    expect(berater).toMatchObject({ role: "berater", legacyId: "legacy-uuid-1", teamId: String(fixture.id.team), mentorId: null });
    expect(berater?.profile).toEqual({ dailyPins: [{ street: "Hauptstr.", at: "2026-10-01T00:00:00.000Z" }] });
    expect(berater?.createdAt.toISOString()).toBe("2026-01-02T03:04:05.000Z");

    const [leader] = await database.db.select().from(users).where(eq(users.id, String(fixture.id.leader)));
    expect(leader).toMatchObject({ email: "leiter@example.de", profile: { billingCity: "Köln" } });
    expect(leader?.profile).not.toHaveProperty("lastIpAddress");
    expect(await database.db.select().from(teamMembers)).toHaveLength(1);
    expect(await database.db.select().from(areaTeams)).toHaveLength(1);
    expect(fixture.reads).not.toContain("audit_logs");
  });

  it("v1-Passwort und v1-Refresh-Cookie gelten danach in v2", async () => {
    const env = loadEnv({ DATABASE_URL: TEST_DATABASE_URL, JWT_SECRET: "j".repeat(40), DATA_CIPHER_KEY: "d".repeat(40), BLIND_INDEX_KEY: "b".repeat(40) });
    const services = createServices(env, database.db);
    const client = { ip: "198.51.100.1" };
    const refreshed = await services.auth.refresh(V1_RAW_REFRESH, client);
    expect(refreshed.refreshToken).not.toBe(V1_RAW_REFRESH);
    const [rotated] = await database.db.select().from(refreshTokens).where(eq(refreshTokens.isRevoked, false));
    expect(rotated?.familyId).toBe("fam-1");

    const login = await services.auth.login({ email: "leiter@example.de", password: V1_PASSWORD }, client);
    expect(login.user).toMatchObject({ id: String(fixture.id.leader), isTrioHeim: true, billingCity: "Köln" });
    expect(login.showTeamLeiterLiveTracking).toBe(false);
  });

  it("läuft nicht ein zweites Mal über bestehende Daten, außer mit --reset", async () => {
    await expect(migrateV1(database.db, fixture.source, { dryRun: false, reset: false, now: NOW })).rejects.toThrow(/schon Nutzer/);
    const report = await migrateV1(database.db, fixture.source, { dryRun: false, reset: true, now: NOW });
    expect(report.counts.users).toBe(3);
    expect(await userCount()).toBe(3);
    expect(await database.db.select().from(refreshTokens)).toHaveLength(1);
  });
});
