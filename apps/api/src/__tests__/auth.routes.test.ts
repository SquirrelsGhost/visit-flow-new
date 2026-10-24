import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { verifyAccessToken } from "../lib/auth/accessToken";
import { ConsentService } from "../modules/consent/ConsentService";
import type { UserRecord } from "../modules/users/User.model";
import { JWT_SECRET, makeAuth, makeUser, PASSWORD } from "./support/authFakes";

const env = { JWT_SECRET, CORS_ORIGINS: [], NODE_ENV: "test" as const };
const noConsent = new ConsentService({ insert: async (entry) => entry, findByConsentId: async () => [] });

function setup(users: UserRecord[]) {
  const auth = makeAuth(users);
  return { ...auth, app: createApp(env, { consent: noConsent, auth: auth.service }) };
}

const refreshCookie = (headers: Record<string, unknown>) =>
  ([] as string[]).concat((headers["set-cookie"] as string[] | undefined) ?? []).find((c) => c.startsWith("vf_refresh="));

describe("POST /api/auth/login", () => {
  let ctx: ReturnType<typeof setup>;
  const user = makeUser();
  beforeEach(() => (ctx = setup([user])));

  it("liefert Token und Nutzer im v1-Format und setzt den Refresh-Cookie wie v1", async () => {
    const res = await request(ctx.app).post("/api/auth/login").send({ email: " Berater@Example.de ", password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ user: { id: user.id, email: user.email, role: "berater" }, showTeamLeiterLiveTracking: true });
    expect(verifyAccessToken(res.body.data.token, JWT_SECRET)).toEqual({ id: user.id, email: user.email, role: "berater" });
    expect(res.body.data.refreshToken).toBeUndefined();
    const cookie = refreshCookie(res.headers);
    expect(cookie).toMatch(/Path=\/api\/auth/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);
  });

  it("gibt weder Passwort-Hash noch IP oder Stripe-ID heraus", async () => {
    const res = await request(ctx.app).post("/api/auth/login").send({ email: user.email, password: PASSWORD });
    expect(JSON.stringify(res.body)).not.toMatch(/\$2[ab]\$|203\.0\.113\.9|cus_123|password/);
  });

  it("antwortet bei falschem Passwort und unbekannter E-Mail identisch", async () => {
    const wrong = await request(ctx.app).post("/api/auth/login").send({ email: user.email, password: "falsch" });
    const unknown = await request(ctx.app).post("/api/auth/login").send({ email: "niemand@example.de", password: "falsch" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it("sperrt nach fünf Fehlversuchen, auch mit richtigem Passwort", async () => {
    for (let i = 0; i < 5; i++) await request(ctx.app).post("/api/auth/login").send({ email: user.email, password: "falsch" });
    const res = await request(ctx.app).post("/api/auth/login").send({ email: user.email, password: PASSWORD });
    expect(res.status).toBe(429);
    expect(res.body.lockedUntil).toBeDefined();
  });

  it("lehnt zusätzliche Felder ab", async () => {
    const res = await request(ctx.app).post("/api/auth/login").send({ email: user.email, password: PASSWORD, role: "admin" });
    expect(res.status).toBe(400);
  });

  it("meldet nicht freigegebene Konten mit whitelistStatus wie v1", async () => {
    const pending = makeUser({ email: "neu@example.de", isWhitelisted: false, whitelistStatus: "pending" });
    const res = await request(setup([pending]).app).post("/api/auth/login").send({ email: pending.email, password: PASSWORD });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ success: false, whitelistStatus: "pending" });
  });

  it("verrät die Sperre erst nach richtigem Passwort", async () => {
    const blocked = makeUser({ email: "gesperrt@example.de", isBlocked: true, blockReason: "Test" });
    const { app } = setup([blocked]);
    const wrong = await request(app).post("/api/auth/login").send({ email: blocked.email, password: "falsch" });
    expect(wrong.status).toBe(401);
    const right = await request(app).post("/api/auth/login").send({ email: blocked.email, password: PASSWORD });
    expect(right.status).toBe(403);
    expect(right.body).toMatchObject({ isBlocked: true, blockReason: "Test" });
  });
});

describe("Refresh, Logout und Profil", () => {
  it("rotiert das Refresh-Token und sperrt die Kette bei Wiederverwendung", async () => {
    const user = makeUser();
    const { app, tokens } = setup([user]);
    const login = await request(app).post("/api/auth/login").send({ email: user.email, password: PASSWORD });
    const first = refreshCookie(login.headers)?.split(";")[0] ?? "";

    const refreshed = await request(app).post("/api/auth/refresh").set("Cookie", first);
    expect(refreshed.status).toBe(200);
    expect(verifyAccessToken(refreshed.body.data.token, JWT_SECRET)?.id).toBe(user.id);
    expect(new Set(tokens.rows.map((t) => t.familyId)).size).toBe(1);

    const replay = await request(app).post("/api/auth/refresh").set("Cookie", first);
    expect(replay.status).toBe(401);
    expect(tokens.rows.every((t) => t.revoked)).toBe(true);
  });

  it("logout sperrt das Token und löscht den Cookie, auch ohne Login", async () => {
    const user = makeUser();
    const { app, tokens } = setup([user]);
    const login = await request(app).post("/api/auth/login").send({ email: user.email, password: PASSWORD });
    const cookie = refreshCookie(login.headers)?.split(";")[0] ?? "";

    const res = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(refreshCookie(res.headers)).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(tokens.rows[0]?.revoked).toBe(true);
    expect((await request(app).post("/api/auth/logout")).status).toBe(200);
  });

  it("liefert /me und /profile nur mit gültigem Token", async () => {
    const user = makeUser();
    const { app } = setup([user]);
    const login = await request(app).post("/api/auth/login").send({ email: user.email, password: PASSWORD });
    for (const path of ["/api/auth/me", "/api/auth/profile"]) {
      expect((await request(app).get(path)).status).toBe(401);
      const res = await request(app).get(path).set("Authorization", `Bearer ${login.body.data.token}`);
      expect(res.body.data.user).toMatchObject({ id: user.id, email: user.email });
    }
  });
});
