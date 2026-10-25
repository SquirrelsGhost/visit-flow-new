import { and, count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../config/env";
import { migrateV1 } from "../migration/v1/migrateV1";
import { v1Ids } from "../migration/v1/V1Id.model";
import { refreshTokens } from "../modules/auth/RefreshToken.model";
import { teamMentors, teams } from "../modules/teams/Team.model";
import { users } from "../modules/users/User.model";
import { createServices } from "../services";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";
import { NOW, V1_PASSWORD, V1_RAW_REFRESH, v1Fixture } from "./support/v1Fixture";

describe.skipIf(!TEST_DATABASE_URL)("Übernahme aus v1 nach PostgreSQL", () => {
  let database: TestDatabase;
  const fixture = v1Fixture();
  const userCount = async () => (await database.db.select({ n: count() }).from(users))[0]?.n;
  const newIdOf = async (collection: string, v1: { toHexString(): string }) =>
    (await database.db.select().from(v1Ids).where(and(eq(v1Ids.collection, collection), eq(v1Ids.v1Id, v1.toHexString()))))[0]?.id ?? "";
  const userOf = async (v1: { toHexString(): string }) => (await database.db.select().from(users).where(eq(users.id, await newIdOf("users", v1))))[0];

  beforeAll(async () => {
    database = await createTestDatabase();
  });
  afterAll(async () => database?.drop());

  it("ändert im Trockenlauf nichts", async () => {
    const report = await migrateV1(database.db, fixture.source, { dryRun: true, reset: false, now: NOW });
    expect(report.counts.users).toBe(4);
    expect(await userCount()).toBe(0);
  });

  it("übernimmt Konten, Teams, Gebiete, Abos und laufende Sitzungen mit neuen UUIDs", async () => {
    const report = await migrateV1(database.db, fixture.source, { dryRun: false, reset: false, now: NOW });
    expect(report.counts).toMatchObject({ users: 4, areas: 1, teams: 1, team_mentors: 1, subscriptions: 1, system_settings: 1, refresh_tokens: 1 });
    expect(Object.keys(report.warnings)).toEqual(expect.arrayContaining([
      "Nutzer ohne ID oder E-Mail übersprungen", "Unbekannte Rolle, als berater übernommen",
      "Doppelte E-Mail, älteres Konto übersprungen", "Verweis auf fehlende(n) Mentor entfernt",
    ]));
    expect(report.summary()).not.toMatch(/@example/);

    const teamId = await newIdOf("teams", fixture.id.team);
    const berater = await userOf(fixture.id.berater);
    expect(berater).toMatchObject({ role: "berater", teamId, mentorId: null, approvalStatus: "approved" });
    expect(berater?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(berater?.createdAt.toISOString()).toBe("2026-01-02T03:04:05.000Z");
    expect(Object.keys(berater ?? {})).not.toContain("dailyPins");

    // Kein teamId in v1, aber in member_ids genau eines Teams
    expect(await userOf(fixture.id.memberOnly)).toMatchObject({ teamId, extraRoles: ["mentor"], approvalStatus: "pending", blockReason: "Test" });
    expect((await userOf(fixture.id.leader))?.phone).toBe("0221 123");
    const [team] = await database.db.select().from(teams);
    expect(team).toMatchObject({ teamLeaderId: await newIdOf("users", fixture.id.leader), areaId: await newIdOf("areas", fixture.id.area) });
    expect(await database.db.select().from(teamMentors)).toHaveLength(1);
    expect(fixture.reads).not.toContain("audit_logs");
  });

  it("v1-Passwort und v1-Refresh-Cookie gelten danach in v2", async () => {
    const env = loadEnv({ DATABASE_URL: TEST_DATABASE_URL, JWT_SECRET: "j".repeat(40), DATA_CIPHER_KEY: "d".repeat(40), BLIND_INDEX_KEY: "b".repeat(40) });
    const services = createServices(env, database.db);
    const client = { ip: "198.51.100.1" };
    const refreshed = await services.auth.refresh(V1_RAW_REFRESH, client);
    expect(refreshed.refreshToken).not.toBe(V1_RAW_REFRESH);
    const [rotated] = await database.db.select().from(refreshTokens).where(eq(refreshTokens.isRevoked, false));
    expect(rotated).toMatchObject({ familyId: "fam-1", userId: await newIdOf("users", fixture.id.leader) });

    const login = await services.auth.login({ email: "leiter@example.de", password: V1_PASSWORD }, client);
    expect(login.user).toMatchObject({ id: await newIdOf("users", fixture.id.leader), isTrioHeim: true, phone: "0221 123" });
    expect(login.showTeamLeiterLiveTracking).toBe(false);
  });

  it("läuft nicht ein zweites Mal über bestehende Daten, außer mit --reset", async () => {
    await expect(migrateV1(database.db, fixture.source, { dryRun: false, reset: false, now: NOW })).rejects.toThrow(/schon Nutzer/);
    const report = await migrateV1(database.db, fixture.source, { dryRun: false, reset: true, now: NOW });
    expect(report.counts.users).toBe(4);
    expect(await userCount()).toBe(4);
    expect(await database.db.select().from(refreshTokens)).toHaveLength(1);
  });
});
