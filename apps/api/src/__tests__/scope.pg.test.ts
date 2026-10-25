import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AccessScope } from "../modules/access/AccessScope";
import { pgScopeSource } from "../modules/access/ScopeSource";
import { subscriptions } from "../modules/billing/Subscription.model";
import { systemSettings } from "../modules/settings/SystemSettings.model";
import { pgUserExtras } from "../modules/users/UserExtras";
import { pgUserRepository } from "../modules/users/UserRepository";
import { seedScope } from "./support/seedScope";
import { createTestDatabase, TEST_DATABASE_URL, type TestDatabase } from "./support/testDatabase";

const requester = (id: string, role: string) => ({ id, email: `${id}@example.de`, role }) as Parameters<AccessScope["canAccessUser"]>[0];

describe.skipIf(!TEST_DATABASE_URL)("Team-Abgrenzung und Profil-Ergänzungen in PostgreSQL", () => {
  let database: TestDatabase;
  let ids: Awaited<ReturnType<typeof seedScope>>;
  let scope: AccessScope;

  beforeAll(async () => {
    database = await createTestDatabase();
    ids = await seedScope(database.db);
    scope = new AccessScope(pgScopeSource(database.db));
  });

  afterAll(async () => database?.drop());

  it("Strukturleiter sieht seine Struktur samt Mentees, aber kein fremdes Team", async () => {
    const accessible = await scope.accessibleUserIds(requester(ids.sl, "strukturleiter"));
    expect(new Set(accessible)).toEqual(new Set([ids.sl, ids.mentor, ids.mentee, ids.memberA]));
    expect(await scope.canAccessTeam(requester(ids.sl, "strukturleiter"), ids.teamA)).toBe(true);
    expect(await scope.canAccessTeam(requester(ids.sl, "strukturleiter"), ids.teamB)).toBe(false);
  });

  it("Gebietsmanager sieht die Teams seines Gebiets", async () => {
    expect(await scope.canAccessTeam(requester(ids.gm, "gebietsmanager"), ids.teamB)).toBe(true);
    expect(await scope.canAccessUser(requester(ids.gm, "gebietsmanager"), ids.memberB)).toBe(true);
    expect(await scope.canAccessUser(requester(ids.gm, "gebietsmanager"), ids.mentee)).toBe(false);
  });

  it("Admin ohne Team sieht alle", async () => {
    expect(await scope.accessibleUserIds(requester(ids.admin, "admin"))).toBeNull();
  });

  it("erkennt Trio-Heim über das Team und ignoriert Zusatzpakete beim Abo-Status", async () => {
    const usersRepo = pgUserRepository(database.db);
    const extras = pgUserExtras(database.db);
    const mentee = await usersRepo.findById(ids.mentee);
    const memberB = await usersRepo.findById(ids.memberB);
    expect(mentee && (await extras.forUser(mentee))).toEqual({ subscriptionStatus: "none", isTrioHeim: true });

    await database.db.insert(subscriptions).values([
      { userId: ids.memberB, planId: "addon-x", status: "active", isAddon: true, createdAt: new Date("2026-10-05") },
      { userId: ids.memberB, planId: "pro-monthly", status: "trialing", createdAt: new Date("2026-10-01") },
    ]);
    expect(memberB && (await extras.forUser(memberB))).toEqual({ subscriptionStatus: "trialing", isTrioHeim: false });
  });

  it("liest den Systemschalter, ohne Zeile gilt true", async () => {
    const extras = pgUserExtras(database.db);
    expect(await extras.showTeamLeiterLiveTracking()).toBe(true);
    await database.db.insert(systemSettings).values({ showTeamLeiterLiveTracking: false });
    expect(await extras.showTeamLeiterLiveTracking()).toBe(false);
  });
});
