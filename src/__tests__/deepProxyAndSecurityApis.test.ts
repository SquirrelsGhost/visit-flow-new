import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET as getAdminDoors } from "../app/api/admin/doors/route";
import { GET as getAdminRevenueStats } from "../app/api/admin/payments/revenue-stats/route";
import { GET as getAdminUnresolvedPayments } from "../app/api/admin/payments/unresolved/route";
import { GET as getAdminProducts } from "../app/api/admin/products/route";
import { GET as getAdminSuspiciousActivity } from "../app/api/admin/suspicious-activity/route";
import { GET as getAdminSystemSettings, PATCH as patchAdminSystemSettings } from "../app/api/admin/system-settings/route";
import { POST as postAdminUnblockIp } from "../app/api/admin/unblock-ip/[ip]/route";
import { PATCH as patchAdminUser } from "../app/api/admin/users/[id]/route";
import { GET as getAdminUsers } from "../app/api/admin/users/route";
import { PATCH as patchChangePassword } from "../app/api/auth/change-password/route";
import { POST as postCompleteRegistration } from "../app/api/auth/complete-registration/route";
import { POST as postAuthLogin } from "../app/api/auth/login/route";
import { POST as postAuthLogout } from "../app/api/auth/logout/route";
import { GET as getAuthMe } from "../app/api/auth/me/route";
import { POST as postOnboardTeam } from "../app/api/auth/onboard-team/route";
import { GET as getPartnerApplications } from "../app/api/auth/partner-applications/route";
import { PATCH as patchAuthProfile } from "../app/api/auth/profile/route";
import { POST as postAuthRefresh } from "../app/api/auth/refresh/route";
import { POST as postSendVerification } from "../app/api/auth/send-verification/route";
import { PATCH as patchTeamMember } from "../app/api/auth/team-members/[id]/route";
import { GET as getTeamMembers } from "../app/api/auth/team-members/route";
import { POST as postVerifyEmail } from "../app/api/auth/verify-email/route";
import { GET as getConsent, POST as postConsent } from "../app/api/consent/route";
import {
  DELETE as deleteSecurity,
  GET as getSecurity,
  POST as postSecurity,
} from "../app/api/security/[[...slug]]/route";
import { POST as postSessionPermissions } from "../app/api/session/permissions/route";
import { DELETE as deleteSession, GET as getSession, POST as postSession } from "../app/api/session/route";
import { DELETE as deleteSitzungen, GET as getSitzungen } from "../app/api/session/sitzungen/route";
import { POST as postSessionSperre } from "../app/api/session/sperre/route";
import { GET as getSystemStatus } from "../app/api/system-status/route";
import { GET as getWhitelistPending } from "../app/api/whitelist/pending/route";
import { loeseLoginPoW } from "../lib/sicherheit/botSchutzClient";
import { hashePasswort } from "../lib/sicherheit/passwortHash";
import { proxy } from "../proxy";
import { LoginBackoffService } from "../services/sicherheit/LoginBackoffService";
import { createSessionToken, readSessionToken, VF_SESSION_COOKIE } from "../services/sicherheit/SessionToken";
import {
  getSessionUser,
  leereKontenL1Cache,
  resetKontenFuerTests,
  sperreKonto,
  upsertSessionAccountAsync,
} from "../services/sicherheit/SessionUserService";
import { ROTATION_INTERVALL_MS, Sitzungswachdienst } from "../services/sicherheit/Sitzungswachdienst";
import type { Permission } from "../types/permissions.types";

const TEST_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0";

async function createAuthenticatedSession(opts: {
  id: string;
  email: string;
  name: string;
  role?: string;
  roles?: string[];
  teamId?: string;
  teamName?: string;
  partnerStatus?: string;
  permissions?: readonly Permission[];
  password?: string;
  nowMs?: number;
}) {
  const passwordHash = opts.password ? hashePasswort(opts.password) : undefined;
  const konto = await upsertSessionAccountAsync({
    id: opts.id,
    email: opts.email,
    name: opts.name,
    role: opts.role ?? "berater",
    roles: opts.roles,
    teamId: opts.teamId,
    teamName: opts.teamName,
    partnerStatus: opts.partnerStatus,
    permissions: opts.permissions,
    passwordHash,
  });
  const initReq = new Request("http://localhost/api/session", {
    headers: { "user-agent": TEST_UA },
  });
  const sitzung = await Sitzungswachdienst.erstelleSitzung(
    konto.id,
    konto.name,
    3600,
    initReq,
    opts.nowMs ?? Date.now(),
  );
  const now = opts.nowMs ?? Date.now();
  const token = createSessionToken(
    {
      id: konto.id,
      version: konto.sitzungsVersion,
      sessionId: sitzung.id,
      tokenId: sitzung.aktivesTokenId,
      exp: now + 3600 * 1000,
    },
    3600,
  );
  const cookieHeader = `${VF_SESSION_COOKIE}=${encodeURIComponent(token)}`;
  return { konto, sitzung, token, cookieHeader };
}

function buildReq(
  url: string,
  options: {
    method?: string;
    cookie?: string;
    body?: unknown;
    rawBody?: string;
    headers?: Record<string, string>;
  } = {},
): NextRequest {
  const headers = new Headers({
    "user-agent": TEST_UA,
    ...(options.headers ?? {}),
  });
  if (options.cookie) {
    headers.set("cookie", options.cookie);
  }
  let bodyInit: BodyInit | undefined;
  if (options.rawBody !== undefined) {
    headers.set("content-type", "application/json");
    bodyInit = options.rawBody;
  } else if (options.body !== undefined) {
    headers.set("content-type", "application/json");
    bodyInit = JSON.stringify(options.body);
  }
  return new NextRequest(url, {
    method: options.method ?? "GET",
    headers,
    body: bodyInit,
  });
}

describe("Deep Proxy & Security/Auth/Admin APIs Integration Suite", () => {
  beforeEach(() => {
    Sitzungswachdienst.resetFuerTests();
    resetKontenFuerTests();
    LoginBackoffService.resetFuerTests();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 1: src/proxy.ts (5-Step Zero-Trust Engine)
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Part 1: src/proxy.ts — 5-Step Zero-Trust Proxy Engine", () => {
    it("Step 1 (Deny by default): blocks unknown API and page routes with 403 JSON", async () => {
      for (const path of ["/api/unknown-endpoint", "/api/unknown", "/unbekannte-seite"]) {
        const res = await proxy(buildReq(`http://localhost${path}`, { method: "GET" }));
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body).toEqual({ success: false, error: "Forbidden" });
      }
    });

    it("Step 2 (Public skip): allows /login, /onboarding, /api/health, POST /api/auth/login, POST /api/consent without session", async () => {
      const publicRequests = [
        buildReq("http://localhost/login", { method: "GET" }),
        buildReq("http://localhost/onboarding", { method: "GET" }),
        buildReq("http://localhost/api/health", { method: "GET" }),
        buildReq("http://localhost/api/auth/login", { method: "POST" }),
        buildReq("http://localhost/api/consent", { method: "POST" }),
      ];

      for (const req of publicRequests) {
        const res = await proxy(req);
        expect(res.status).toBe(200);
      }
    });

    it("Step 3 (Session + Ban check): redirects unauthenticated pages to /login?from=..., returns 401 on APIs, and blocks banned users", async () => {
      // 3a. Unauthenticated page requests -> 307 redirect to /login?from=...
      for (const page of ["/dashboard", "/admin-dashboard", "/security-dashboard", "/fahrtenbuch"]) {
        const res = await proxy(buildReq(`http://localhost${page}`));
        expect([307, 308]).toContain(res.status);
        expect(res.headers.get("location")).toBe(`http://localhost/login?from=${encodeURIComponent(page)}`);
      }

      // 3b. Unauthenticated API requests -> 401 JSON
      for (const apiPath of ["/api/admin/users", "/api/abrechnung", "/api/consent"]) {
        const res = await proxy(buildReq(`http://localhost${apiPath}`, { method: "GET" }));
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.success).toBe(false);
      }

      // 3c. Banned user page & API requests
      const bannedSession = await createAuthenticatedSession({
        id: "banned-berater-1",
        email: "banned@pycie.com",
        name: "Gesperrter Nutzer",
        role: "berater",
      });
      await sperreKonto("banned-berater-1", "Missbrauch festgestellt");

      const bannedPageRes = await proxy(
        buildReq("http://localhost/dashboard", { cookie: bannedSession.cookieHeader }),
      );
      expect([307, 308]).toContain(bannedPageRes.status);
      expect(bannedPageRes.headers.get("location")).toBe("http://localhost/login?banned=1");

      const bannedApiRes = await proxy(
        buildReq("http://localhost/api/abrechnung", { cookie: bannedSession.cookieHeader }),
      );
      expect(bannedApiRes.status).toBe(403);
      const bannedApiJson = await bannedApiRes.json();
      expect(bannedApiJson).toEqual({
        success: false,
        error: "Missbrauch festgestellt",
      });
    });

    it("Step 4 (Capability check): blocks regular advisor on admin routes and allows advisor with SONDER_PERMISSIONS", async () => {
      const regularAdvisor = await createAuthenticatedSession({
        id: "berater-std",
        email: "std@pycie.com",
        name: "Standard Berater",
        role: "berater",
      });

      // Advisor requesting /admin-dashboard -> redirected to /dashboard
      const adminPageRes = await proxy(
        buildReq("http://localhost/admin-dashboard", { cookie: regularAdvisor.cookieHeader }),
      );
      expect([307, 308]).toContain(adminPageRes.status);
      expect(adminPageRes.headers.get("location")).toBe("http://localhost/dashboard");

      // Advisor requesting protected admin/security APIs -> 403 JSON with "Keine Berechtigung (...)"
      const forbiddenApiChecks: Array<{ method: string; path: string; expectedCap: string }> = [
        { method: "GET", path: "/api/admin/users", expectedCap: "admin:*" },
        { method: "GET", path: "/api/doors/admin/all", expectedCap: "admin:streets" },
        { method: "GET", path: "/api/products/admin/expiring", expectedCap: "admin:expiring" },
        { method: "POST", path: "/api/session/permissions", expectedCap: "admin:permissions" },
        { method: "GET", path: "/api/consent", expectedCap: "admin:security" },
      ];

      for (const check of forbiddenApiChecks) {
        const res = await proxy(
          buildReq(`http://localhost${check.path}`, {
            method: check.method,
            cookie: regularAdvisor.cookieHeader,
          }),
        );
        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.success).toBe(false);
        expect(body.error).toContain(`Keine Berechtigung (${check.expectedCap})`);
      }

      // Advisor granted SONDER_PERMISSIONS (admin:expiring, team:backoffice) -> 200 pass-through
      const specialAdvisor = await createAuthenticatedSession({
        id: "berater-sonder",
        email: "sonder@pycie.com",
        name: "Sonder Berater",
        role: "berater",
        permissions: ["admin:expiring", "team:backoffice"],
      });

      for (const allowedPath of [
        "/expiring-contracts",
        "/api/products/admin/expiring",
        "/team-backoffice",
      ]) {
        const res = await proxy(
          buildReq(`http://localhost${allowedPath}`, {
            method: "GET",
            cookie: specialAdvisor.cookieHeader,
          }),
        );
        expect(res.status).toBe(200);
      }
    });

    it("Step 5 (Anti-Spoofing headers): strips forged x-user-* headers and injects verified session values", async () => {
      const berater9 = await createAuthenticatedSession({
        id: "berater-9",
        email: "berater9@pycie.com",
        name: "Berater Neun",
        role: "berater",
      });

      const forgedReq = buildReq("http://localhost/dashboard", {
        cookie: berater9.cookieHeader,
        headers: {
          "x-user-id": "admin-1",
          "x-user-name": "Hacker",
          "x-user-permissions": "*",
        },
      });

      const res = await proxy(forgedReq);
      expect(res.status).toBe(200);
      expect(res.headers.get("x-middleware-override-headers")).toContain("x-user-id");
      expect(res.headers.get("x-middleware-request-x-user-id")).toBe("berater-9");
      expect(res.headers.get("x-middleware-request-x-user-name")).toBe("Berater Neun");
      const injectedPerms = (res.headers.get("x-middleware-request-x-user-permissions") ?? "").split(",");
      expect(injectedPerms).not.toContain("*");
      expect(injectedPerms).not.toContain("admin:*");
      expect(injectedPerms).toContain("crm:own");
      expect(injectedPerms).toContain("abrechnung:*");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 2: Auth API Routes (/api/auth/*)
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Part 2: Direct Route-Handler Tests — /api/auth/*", () => {
    it("POST /api/auth/send-verification, /api/auth/verify-email & /api/auth/complete-registration (rejecting wrong verificationCode & trash-mail)", async () => {
      // 1. send-verification rejects invalid & trash-mail
      const badEmailRes = await postSendVerification(
        buildReq("http://localhost/api/auth/send-verification", {
          method: "POST",
          body: { email: "invalid-email", name: "Test" },
        }),
      );
      expect(badEmailRes.status).toBe(400);

      const trashEmailRes = await postSendVerification(
        buildReq("http://localhost/api/auth/send-verification", {
          method: "POST",
          body: { email: "bot@10minutemail.com", name: "Bot" },
        }),
      );
      expect(trashEmailRes.status).toBe(400);

      // 2. send-verification succeeds for valid email
      const validEmail = "neu.berater@pycie.com";
      const sendRes = await postSendVerification(
        buildReq("http://localhost/api/auth/send-verification", {
          method: "POST",
          body: { email: validEmail, name: "Neuer Berater" },
        }),
      );
      expect(sendRes.status).toBe(200);
      expect((await sendRes.json()).data).toEqual({ sent: true });

      // 3. verify-email rejects wrong code (999999) and accepts dev code (123456)
      const wrongVerifyRes = await postVerifyEmail(
        buildReq("http://localhost/api/auth/verify-email", {
          method: "POST",
          body: { email: validEmail, code: "999999" },
        }),
      );
      expect(wrongVerifyRes.status).toBe(400);

      const rightVerifyRes = await postVerifyEmail(
        buildReq("http://localhost/api/auth/verify-email", {
          method: "POST",
          body: { email: validEmail, code: "123456" },
        }),
      );
      expect(rightVerifyRes.status).toBe(200);
      expect((await rightVerifyRes.json()).data).toEqual({ verified: true });

      // 4. complete-registration rejects missing fields, trash-mail, and wrong verificationCode
      const missingFieldsRes = await postCompleteRegistration(
        buildReq("http://localhost/api/auth/complete-registration", {
          method: "POST",
          body: { email: validEmail },
        }),
      );
      expect(missingFieldsRes.status).toBe(400);

      const wrongCodeRegRes = await postCompleteRegistration(
        buildReq("http://localhost/api/auth/complete-registration", {
          method: "POST",
          body: {
            email: validEmail,
            name: "Neuer Berater",
            password: "StrongPassword123!",
            vpkn: "VF-100",
            verificationCode: "000000",
          },
        }),
      );
      expect(wrongCodeRegRes.status).toBe(400);
      expect((await wrongCodeRegRes.json()).error).toContain("Verifizierungscode");

      // 5. complete-registration succeeds with valid verificationCode
      const okRegRes = await postCompleteRegistration(
        buildReq("http://localhost/api/auth/complete-registration", {
          method: "POST",
          body: {
            email: validEmail,
            name: "Neuer Berater",
            password: "StrongPassword123!",
            vpkn: "VF-100",
            verificationCode: "123456",
          },
        }),
      );
      expect(okRegRes.status).toBe(201);
      expect(okRegRes.headers.get("set-cookie")).toContain(VF_SESSION_COOKIE);
      const regBody = await okRegRes.json();
      expect(regBody.success).toBe(true);
      expect(regBody.data.user.email).toBe(validEmail);

      // 6. Duplicate registration returns 409
      const dupRegRes = await postCompleteRegistration(
        buildReq("http://localhost/api/auth/complete-registration", {
          method: "POST",
          body: {
            email: validEmail,
            name: "Neuer Berater",
            password: "StrongPassword123!",
          },
        }),
      );
      expect(dupRegRes.status).toBe(409);
    });

    it("POST /api/auth/login, GET /api/auth/me, PATCH /api/auth/profile, PATCH /api/auth/change-password & POST /api/auth/logout", async () => {
      // Seed user via registration
      await postCompleteRegistration(
        buildReq("http://localhost/api/auth/complete-registration", {
          method: "POST",
          body: {
            email: "login.tester@pycie.com",
            name: "Login Tester",
            password: "InitialPassword123!",
            vpkn: "VF-777",
          },
        }),
      );

      // 1. Login without PoW / with honeypot -> 400
      const noPowRes = await postAuthLogin(
        buildReq("http://localhost/api/auth/login", {
          method: "POST",
          body: { email: "login.tester@pycie.com", password: "InitialPassword123!" },
        }),
      );
      expect(noPowRes.status).toBe(400);

      // 2. Login with wrong password -> 401
      const pow1 = await loeseLoginPoW();
      const wrongPassRes = await postAuthLogin(
        buildReq("http://localhost/api/auth/login", {
          method: "POST",
          body: {
            email: "login.tester@pycie.com",
            password: "WrongPassword!",
            powTs: pow1.powTs,
            powNonce: pow1.powNonce,
            honeypot: "",
          },
        }),
      );
      expect(wrongPassRes.status).toBe(401);

      // 3. Valid login -> 200 + set-cookie + token
      const pow2 = await loeseLoginPoW();
      const loginRes = await postAuthLogin(
        buildReq("http://localhost/api/auth/login", {
          method: "POST",
          body: {
            email: "login.tester@pycie.com",
            password: "InitialPassword123!",
            powTs: pow2.powTs,
            powNonce: pow2.powNonce,
            honeypot: "",
          },
        }),
      );
      expect(loginRes.status).toBe(200);
      const loginJson = await loginRes.json();
      expect(loginJson.success).toBe(true);
      const token: string = loginJson.data.token;
      const cookie = `${VF_SESSION_COOKIE}=${encodeURIComponent(token)}`;

      // 4. GET /api/auth/me (unauthenticated -> 401, authenticated -> 200)
      expect((await getAuthMe(buildReq("http://localhost/api/auth/me"))).status).toBe(401);
      const meRes = await getAuthMe(buildReq("http://localhost/api/auth/me", { cookie }));
      expect(meRes.status).toBe(200);
      const meJson = await meRes.json();
      expect(meJson.data.user.email).toBe("login.tester@pycie.com");

      // 5. PATCH /api/auth/profile (unauthenticated -> 401, unauthorized -> 403, authorized -> 200)
      expect(
        (
          await patchAuthProfile(
            buildReq("http://localhost/api/auth/profile", {
              method: "PATCH",
              body: { name: "Anon" },
            }),
          )
        ).status,
      ).toBe(401);

      const restrictedUser = await createAuthenticatedSession({
        id: "restricted-guest",
        email: "guest@pycie.com",
        name: "Guest",
        role: "gast",
        permissions: ["daily:*"],
      });
      const forbiddenProfileRes = await patchAuthProfile(
        buildReq("http://localhost/api/auth/profile", {
          method: "PATCH",
          cookie: restrictedUser.cookieHeader,
          body: { name: "No Profile Right" },
        }),
      );
      expect(forbiddenProfileRes.status).toBe(403);

      const profileRes = await patchAuthProfile(
        buildReq("http://localhost/api/auth/profile", {
          method: "PATCH",
          cookie,
          body: { name: "Login Tester Updated", phone: "+491701234567", vpkn: "VF-888" },
        }),
      );
      expect(profileRes.status).toBe(200);
      const profileJson = await profileRes.json();
      expect(profileJson.data.user.name).toBe("Login Tester Updated");
      expect(profileJson.data.user.phone).toBe("+491701234567");
      expect(profileJson.data.user.vpkn).toBe("VF-888");

      // 6. PATCH /api/auth/change-password (401 unauth, 400 short/wrong password, 200 valid + rotates sitzungsVersion)
      expect(
        (
          await patchChangePassword(
            buildReq("http://localhost/api/auth/change-password", {
              method: "PATCH",
              body: { currentPassword: "InitialPassword123!", newPassword: "NewPassword123!" },
            }),
          )
        ).status,
      ).toBe(401);

      const shortPassRes = await patchChangePassword(
        buildReq("http://localhost/api/auth/change-password", {
          method: "PATCH",
          cookie,
          body: { currentPassword: "InitialPassword123!", newPassword: "short" },
        }),
      );
      expect(shortPassRes.status).toBe(400);

      const wrongCurrPassRes = await patchChangePassword(
        buildReq("http://localhost/api/auth/change-password", {
          method: "PATCH",
          cookie,
          body: { currentPassword: "WrongCurrentPassword!", newPassword: "NewSecurePassword123!" },
        }),
      );
      expect(wrongCurrPassRes.status).toBe(400);

      const changePassRes = await patchChangePassword(
        buildReq("http://localhost/api/auth/change-password", {
          method: "PATCH",
          cookie,
          body: { currentPassword: "InitialPassword123!", newPassword: "NewSecurePassword123!" },
        }),
      );
      expect(changePassRes.status).toBe(200);
      const newSetCookie = changePassRes.headers.get("set-cookie") ?? "";
      expect(newSetCookie).toContain(VF_SESSION_COOKIE);

      // Old cookie is immediately invalidated because sitzungsVersion incremented
      expect((await getAuthMe(buildReq("http://localhost/api/auth/me", { cookie }))).status).toBe(401);

      // 7. POST /api/auth/logout clears session
      const newToken = decodeURIComponent((newSetCookie.split(";")[0] ?? "").split("=")[1] ?? "");
      const newCookie = `${VF_SESSION_COOKIE}=${encodeURIComponent(newToken)}`;
      expect((await getAuthMe(buildReq("http://localhost/api/auth/me", { cookie: newCookie }))).status).toBe(200);

      const logoutRes = await postAuthLogout(
        buildReq("http://localhost/api/auth/logout", { method: "POST", cookie: newCookie }),
      );
      expect(logoutRes.status).toBe(200);
      expect((await getAuthMe(buildReq("http://localhost/api/auth/me", { cookie: newCookie }))).status).toBe(401);
    });

    it("POST /api/auth/refresh returns 401 when unauthenticated and rotates token after 15 minutes returning the new token", async () => {
      // Unauthenticated -> 401
      const unauthRefresh = await postAuthRefresh(
        buildReq("http://localhost/api/auth/refresh", { method: "POST" }),
      );
      expect(unauthRefresh.status).toBe(401);

      // Create session 16 minutes in the past so refresh triggers 15-min token rotation
      const pastMs = Date.now() - (ROTATION_INTERVALL_MS + 60_000);
      const session = await createAuthenticatedSession({
        id: "refresh-user-1",
        email: "refresh@pycie.com",
        name: "Refresh User",
        role: "berater",
        nowMs: pastMs,
      });

      const refreshRes = await postAuthRefresh(
        buildReq("http://localhost/api/auth/refresh", {
          method: "POST",
          cookie: session.cookieHeader,
        }),
      );
      expect(refreshRes.status).toBe(200);
      const refreshJson = await refreshRes.json();
      expect(refreshJson.success).toBe(true);
      const newToken: string = refreshJson.data.token;
      expect(newToken).toBeTruthy();
      expect(newToken).not.toBe(session.token);

      const parsedOld = readSessionToken(session.token);
      const parsedNew = readSessionToken(newToken);
      expect(parsedNew?.sessionId).toBe(parsedOld?.sessionId);
      expect(parsedNew?.tokenId).not.toBe(parsedOld?.tokenId);
      expect(refreshRes.headers.get("set-cookie")).toContain(encodeURIComponent(newToken));
    });

    it("POST /api/auth/onboard-team, GET /api/auth/partner-applications, GET & PATCH /api/auth/team-members", async () => {
      // 1. onboard-team rejects missing fields & trash-mail
      expect(
        (
          await postOnboardTeam(
            buildReq("http://localhost/api/auth/onboard-team", {
              method: "POST",
              body: { teamName: "Incomplete Team" },
            }),
          )
        ).status,
      ).toBe(400);

      const trashOnboardRes = await postOnboardTeam(
        buildReq("http://localhost/api/auth/onboard-team", {
          method: "POST",
          body: {
            teamName: "Trash Team",
            name: "Trash Leader",
            email: "leader@yopmail.com",
            password: "Password123!",
          },
        }),
      );
      expect(trashOnboardRes.status).toBe(400);

      // 2. onboard-team succeeds for valid team leader
      const onboardRes = await postOnboardTeam(
        buildReq("http://localhost/api/auth/onboard-team", {
          method: "POST",
          body: {
            teamName: "Team Rheinland",
            name: "Rheinland Leader",
            email: "leader.rheinland@pycie.com",
            password: "Password123!",
            licenseCount: 8,
          },
        }),
      );
      expect(onboardRes.status).toBe(201);
      const onboardJson = await onboardRes.json();
      expect(onboardJson.data.team.name).toBe("Team Rheinland");
      const leaderCookie = `${VF_SESSION_COOKIE}=${encodeURIComponent(onboardJson.data.token)}`;
      const leaderId: string = onboardJson.data.user.id;

      // 3. Duplicate email on onboard-team -> 409
      const dupOnboardRes = await postOnboardTeam(
        buildReq("http://localhost/api/auth/onboard-team", {
          method: "POST",
          body: {
            teamName: "Team Duplicate",
            name: "Dup Leader",
            email: "leader.rheinland@pycie.com",
            password: "Password123!",
          },
        }),
      );
      expect(dupOnboardRes.status).toBe(409);

      // 4. GET /api/auth/partner-applications (401 unauth, 403 advisor, 200 admin)
      const partnerCandidate = await createAuthenticatedSession({
        id: "partner-cand-1",
        email: "partner@pycie.com",
        name: "Partner Kandidat",
        role: "berater",
        partnerStatus: "pending",
      });
      const adminSession = await createAuthenticatedSession({
        id: "admin-main",
        email: "admin@pycie.com",
        name: "Admin",
        role: "admin",
      });

      expect((await getPartnerApplications(buildReq("http://localhost/api/auth/partner-applications"))).status).toBe(
        401,
      );
      expect(
        (
          await getPartnerApplications(
            buildReq("http://localhost/api/auth/partner-applications", {
              cookie: partnerCandidate.cookieHeader,
            }),
          )
        ).status,
      ).toBe(403);

      const partnerAppsRes = await getPartnerApplications(
        buildReq("http://localhost/api/auth/partner-applications", {
          cookie: adminSession.cookieHeader,
        }),
      );
      expect(partnerAppsRes.status).toBe(200);
      const partnerAppsJson = await partnerAppsRes.json();
      expect(partnerAppsJson.data.some((p: { id: string }) => p.id === "partner-cand-1")).toBe(true);

      // 5. GET /api/auth/team-members & PATCH /api/auth/team-members/[id]
      expect((await getTeamMembers(buildReq("http://localhost/api/auth/team-members"))).status).toBe(401);
      expect(
        (
          await getTeamMembers(
            buildReq("http://localhost/api/auth/team-members", { cookie: partnerCandidate.cookieHeader }),
          )
        ).status,
      ).toBe(403);

      const leaderMembersRes = await getTeamMembers(
        buildReq("http://localhost/api/auth/team-members", { cookie: leaderCookie }),
      );
      expect(leaderMembersRes.status).toBe(200);
      const leaderMembersJson = await leaderMembersRes.json();
      expect(leaderMembersJson.data.users.some((u: { id: string }) => u.id === leaderId)).toBe(true);

      // PATCH /api/auth/team-members/[id]: 401 unauth, 403 advisor, 400 malformed JSON, 403 teamleiter assigning admin role, 200 valid patch
      expect(
        (
          await patchTeamMember(buildReq("http://localhost/api/auth/team-members/partner-cand-1", { method: "PATCH" }), {
            params: Promise.resolve({ id: "partner-cand-1" }),
          })
        ).status,
      ).toBe(401);

      expect(
        (
          await patchTeamMember(
            buildReq("http://localhost/api/auth/team-members/partner-cand-1", {
              method: "PATCH",
              cookie: partnerCandidate.cookieHeader,
              body: { dailyStatus: "active" },
            }),
            { params: Promise.resolve({ id: "partner-cand-1" }) },
          )
        ).status,
      ).toBe(403);

      expect(
        (
          await patchTeamMember(
            buildReq("http://localhost/api/auth/team-members/partner-cand-1", {
              method: "PATCH",
              cookie: leaderCookie,
              rawBody: "{not-valid-json",
            }),
            { params: Promise.resolve({ id: "partner-cand-1" }) },
          )
        ).status,
      ).toBe(400);

      // Teamleiter cannot escalate a member to admin
      const escalateAttempt = await patchTeamMember(
        buildReq("http://localhost/api/auth/team-members/partner-cand-1", {
          method: "PATCH",
          cookie: leaderCookie,
          body: { role: "admin" },
        }),
        { params: Promise.resolve({ id: "partner-cand-1" }) },
      );
      expect(escalateAttempt.status).toBe(403);

      // Valid patch by teamleiter
      const validMemberPatch = await patchTeamMember(
        buildReq("http://localhost/api/auth/team-members/partner-cand-1", {
          method: "PATCH",
          cookie: leaderCookie,
          body: { dailyAttendance: "on_time" },
        }),
        { params: Promise.resolve({ id: "partner-cand-1" }) },
      );
      expect(validMemberPatch.status).toBe(200);
      expect((await validMemberPatch.json()).data.user.dailyAttendance).toBe("on_time");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 3: Session & Watchdog API Routes (/api/session/*)
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Part 3: Direct Route-Handler Tests — /api/session/*", () => {
    it("GET/POST/DELETE /api/session handles malformed JSON (400), privilege escalation block (403), password hijack block (401), and valid lifecycle", async () => {
      // 1. Malformed JSON -> 400
      const malformedRes = await postSession(
        buildReq("http://localhost/api/session", {
          method: "POST",
          rawBody: "{broken-json",
        }),
      );
      expect(malformedRes.status).toBe(400);

      // 2. Create password-protected account
      await createAuthenticatedSession({
        id: "protected-user-1",
        email: "protected@pycie.com",
        name: "Protected User",
        role: "berater",
        password: "SecretPassword99!",
      });

      // 3. Unauthenticated attempt to hijack password-protected account without password -> 401
      const pow1 = await loeseLoginPoW();
      const hijackRes = await postSession(
        buildReq("http://localhost/api/session", {
          method: "POST",
          body: {
            id: "protected-user-1",
            email: "protected@pycie.com",
            powTs: pow1.powTs,
            powNonce: pow1.powNonce,
            honeypot: "",
          },
        }),
      );
      expect(hijackRes.status).toBe(401);

      // 4. Unauthenticated attempt to escalate role to admin on password-protected account -> 403
      const pow2 = await loeseLoginPoW();
      const escalationRes = await postSession(
        buildReq("http://localhost/api/session", {
          method: "POST",
          body: {
            id: "protected-user-1",
            email: "protected@pycie.com",
            password: "SecretPassword99!",
            role: "admin",
            permissions: ["*"],
            powTs: pow2.powTs,
            powNonce: pow2.powNonce,
            honeypot: "",
          },
        }),
      );
      expect(escalationRes.status).toBe(403);

      // 5. Valid POST /api/session with correct password -> 201
      const pow3 = await loeseLoginPoW();
      const establishRes = await postSession(
        buildReq("http://localhost/api/session", {
          method: "POST",
          body: {
            id: "protected-user-1",
            email: "protected@pycie.com",
            password: "SecretPassword99!",
            powTs: pow3.powTs,
            powNonce: pow3.powNonce,
            honeypot: "",
          },
        }),
      );
      expect(establishRes.status).toBe(201);
      const setCookie = establishRes.headers.get("set-cookie") ?? "";
      const token = decodeURIComponent((setCookie.split(";")[0] ?? "").split("=")[1] ?? "");
      const cookie = `${VF_SESSION_COOKIE}=${encodeURIComponent(token)}`;

      // 6. GET /api/session -> authenticated: true
      const getRes = await getSession(buildReq("http://localhost/api/session", { cookie }));
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.data.authenticated).toBe(true);
      expect(getJson.data.user.id).toBe("protected-user-1");

      // 7. DELETE /api/session -> loggedOut: true & invalidates session
      const delRes = await deleteSession(buildReq("http://localhost/api/session", { method: "DELETE", cookie }));
      expect(delRes.status).toBe(200);
      const afterDelRes = await getSession(buildReq("http://localhost/api/session", { cookie }));
      expect((await afterDelRes.json()).data.authenticated).toBe(false);
    });

    it("POST /api/session/permissions enforces auth (401), capability (403), malformed JSON (400), and updates capabilities (200)", async () => {
      const advisor = await createAuthenticatedSession({
        id: "berater-perm-target",
        email: "target@pycie.com",
        name: "Target Berater",
        role: "berater",
      });
      const admin = await createAuthenticatedSession({
        id: "admin-perm-actor",
        email: "admin.perm@pycie.com",
        name: "Admin Actor",
        role: "admin",
      });

      // Unauthenticated -> 401
      expect(
        (
          await postSessionPermissions(
            buildReq("http://localhost/api/session/permissions", {
              method: "POST",
              body: { userId: "berater-perm-target", permissions: ["admin:expiring"] },
            }),
          )
        ).status,
      ).toBe(401);

      // Advisor without admin:permissions -> 403
      expect(
        (
          await postSessionPermissions(
            buildReq("http://localhost/api/session/permissions", {
              method: "POST",
              cookie: advisor.cookieHeader,
              body: { userId: "berater-perm-target", permissions: ["admin:expiring"] },
            }),
          )
        ).status,
      ).toBe(403);

      // Malformed JSON -> 400
      expect(
        (
          await postSessionPermissions(
            buildReq("http://localhost/api/session/permissions", {
              method: "POST",
              cookie: admin.cookieHeader,
              rawBody: "not-json",
            }),
          )
        ).status,
      ).toBe(400);

      // Valid grant by admin -> 200
      const grantRes = await postSessionPermissions(
        buildReq("http://localhost/api/session/permissions", {
          method: "POST",
          cookie: admin.cookieHeader,
          body: { userId: "berater-perm-target", permissions: ["admin:expiring"] },
        }),
      );
      expect(grantRes.status).toBe(200);
      const grantJson = await grantRes.json();
      expect(grantJson.data.permissions).toContain("admin:expiring");
    });

    it("GET & DELETE /api/session/sitzungen lists sessions, blocks IDOR deletion (403), and revokes own sessions", async () => {
      const userA1 = await createAuthenticatedSession({
        id: "user-a",
        email: "a@pycie.com",
        name: "User A",
        role: "berater",
      });
      await createAuthenticatedSession({
        id: "user-a",
        email: "a@pycie.com",
        name: "User A",
        role: "berater",
      });
      const userB = await createAuthenticatedSession({
        id: "user-b",
        email: "b@pycie.com",
        name: "User B",
        role: "berater",
      });

      // Unauthenticated -> 401
      expect((await getSitzungen(buildReq("http://localhost/api/session/sitzungen"))).status).toBe(401);
      expect(
        (await deleteSitzungen(buildReq("http://localhost/api/session/sitzungen", { method: "DELETE" }))).status,
      ).toBe(401);

      // GET /api/session/sitzungen lists both active sessions of User A
      const listRes = await getSitzungen(
        buildReq("http://localhost/api/session/sitzungen", { cookie: userA1.cookieHeader }),
      );
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json();
      expect(listJson.data.sitzungen).toHaveLength(2);
      expect(listJson.data.aktuelleSitzungId).toBe(userA1.sitzung.id);

      // IDOR attempt: User A tries to delete User B's session -> 403
      const idorRes = await deleteSitzungen(
        buildReq(`http://localhost/api/session/sitzungen?id=${userB.sitzung.id}`, {
          method: "DELETE",
          cookie: userA1.cookieHeader,
        }),
      );
      expect(idorRes.status).toBe(403);

      // User A revokes all other sessions (keeps userA1.sitzung.id, revokes userA2.sitzung.id)
      const revokeOthersRes = await deleteSitzungen(
        buildReq("http://localhost/api/session/sitzungen", {
          method: "DELETE",
          cookie: userA1.cookieHeader,
        }),
      );
      expect(revokeOthersRes.status).toBe(200);
      expect((await revokeOthersRes.json()).data.widerrufen).toBe(1);
    });

    it("POST /api/session/sperre locks and unlocks accounts even with a cold L1 cache", async () => {
      const targetUser = await createAuthenticatedSession({
        id: "sperr-kandidat",
        email: "kandidat@pycie.com",
        name: "Sperr Kandidat",
        role: "berater",
      });
      const secAdmin = await createAuthenticatedSession({
        id: "sec-admin-1",
        email: "sec@pycie.com",
        name: "Security Admin",
        role: "admin",
      });

      // Unauthenticated -> 401, Advisor -> 403, Malformed -> 400
      expect(
        (
          await postSessionSperre(
            buildReq("http://localhost/api/session/sperre", {
              method: "POST",
              body: { userId: "sperr-kandidat" },
            }),
          )
        ).status,
      ).toBe(401);

      expect(
        (
          await postSessionSperre(
            buildReq("http://localhost/api/session/sperre", {
              method: "POST",
              cookie: targetUser.cookieHeader,
              body: { userId: "sperr-kandidat" },
            }),
          )
        ).status,
      ).toBe(403);

      expect(
        (
          await postSessionSperre(
            buildReq("http://localhost/api/session/sperre", {
              method: "POST",
              cookie: secAdmin.cookieHeader,
              rawBody: "{bad",
            }),
          )
        ).status,
      ).toBe(400);

      // 1. Lock account via POST /api/session/sperre
      const lockRes = await postSessionSperre(
        buildReq("http://localhost/api/session/sperre", {
          method: "POST",
          cookie: secAdmin.cookieHeader,
          body: { userId: "sperr-kandidat", aktion: "sperren", grund: "Verdächtige Zugriffe" },
        }),
      );
      expect(lockRes.status).toBe(200);
      expect((await lockRes.json()).data.banned).toBe(true);

      // Clear L1 cache to simulate cold worker and verify ban persists in DB
      leereKontenL1Cache();
      const bannedState = await getSessionUser(
        buildReq("http://localhost/api/auth/me", { cookie: targetUser.cookieHeader }),
      );
      expect(bannedState?.banned).toBe(true);
      expect(bannedState?.banReason).toBe("Verdächtige Zugriffe");

      // 2. Unlock account with cold L1 cache via POST /api/session/sperre (aktion: "entsperren")
      leereKontenL1Cache();
      const unlockRes = await postSessionSperre(
        buildReq("http://localhost/api/session/sperre", {
          method: "POST",
          cookie: secAdmin.cookieHeader,
          body: { userId: "sperr-kandidat", aktion: "entsperren" },
        }),
      );
      expect(unlockRes.status).toBe(200);
      expect((await unlockRes.json()).data.banned).toBe(false);

      // Clear L1 cache again and verify getSessionUser returns banned === false
      leereKontenL1Cache();
      const unbannedState = await getSessionUser(
        buildReq("http://localhost/api/auth/me", { cookie: targetUser.cookieHeader }),
      );
      expect(unbannedState).not.toBeNull();
      expect(unbannedState?.banned).toBe(false);
      expect(unbannedState?.permissions).toContain("crm:own");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 4: Admin & System-Status API Routes (/api/admin/* & /api/system-status)
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Part 4: Direct Route-Handler Tests — /api/admin/* & /api/system-status", () => {
    it("GET /api/admin/users & PATCH /api/admin/users/[id] (isBlocked: true then isBlocked: false clears ban in getSessionUser)", async () => {
      const advisor = await createAuthenticatedSession({
        id: "berater-block-test",
        email: "blocktest@pycie.com",
        name: "Block Test Berater",
        role: "berater",
      });
      const admin = await createAuthenticatedSession({
        id: "admin-users-actor",
        email: "admin.users@pycie.com",
        name: "Admin Users",
        role: "admin",
      });

      // Unauthenticated -> 401, Advisor -> 403
      expect((await getAdminUsers(buildReq("http://localhost/api/admin/users"))).status).toBe(401);
      expect(
        (await getAdminUsers(buildReq("http://localhost/api/admin/users", { cookie: advisor.cookieHeader }))).status,
      ).toBe(403);

      // Admin GET /api/admin/users -> 200
      const listRes = await getAdminUsers(
        buildReq("http://localhost/api/admin/users", { cookie: admin.cookieHeader }),
      );
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json();
      expect(listJson.data.users.some((u: { id: string }) => u.id === "berater-block-test")).toBe(true);

      // Admin PATCH /api/admin/users/[id] -> isBlocked: true
      const blockRes = await patchAdminUser(
        buildReq("http://localhost/api/admin/users/berater-block-test", {
          method: "PATCH",
          cookie: admin.cookieHeader,
          body: { isBlocked: true, blockReason: "Compliance-Prüfung" },
        }),
        { params: Promise.resolve({ id: "berater-block-test" }) },
      );
      expect(blockRes.status).toBe(200);
      expect((await blockRes.json()).data.user.isBlocked).toBe(true);

      const sessionAfterBlock = await getSessionUser(
        buildReq("http://localhost/dashboard", { cookie: advisor.cookieHeader }),
      );
      expect(sessionAfterBlock?.banned).toBe(true);
      expect(sessionAfterBlock?.banReason).toBe("Compliance-Prüfung");

      // Admin PATCH /api/admin/users/[id] -> isBlocked: false
      const unblockRes = await patchAdminUser(
        buildReq("http://localhost/api/admin/users/berater-block-test", {
          method: "PATCH",
          cookie: admin.cookieHeader,
          body: { isBlocked: false },
        }),
        { params: Promise.resolve({ id: "berater-block-test" }) },
      );
      expect(unblockRes.status).toBe(200);
      expect((await unblockRes.json()).data.user.isBlocked).toBe(false);

      // Verify getSessionUser reflects banned === false both warm and with cold L1 cache
      const sessionAfterUnblock = await getSessionUser(
        buildReq("http://localhost/dashboard", { cookie: advisor.cookieHeader }),
      );
      expect(sessionAfterUnblock?.banned).toBe(false);

      leereKontenL1Cache();
      const sessionAfterColdUnblock = await getSessionUser(
        buildReq("http://localhost/dashboard", { cookie: advisor.cookieHeader }),
      );
      expect(sessionAfterColdUnblock?.banned).toBe(false);
    });

    it("GET/PATCH /api/admin/system-settings & GET /api/system-status dynamically update bypassCompanyEmailRequirement", async () => {
      const advisor = await createAuthenticatedSession({
        id: "berater-sys",
        email: "sys.berater@pycie.com",
        name: "Sys Berater",
        role: "berater",
      });
      const admin = await createAuthenticatedSession({
        id: "admin-sys",
        email: "sys.admin@pycie.com",
        name: "Sys Admin",
        role: "admin",
      });

      // Unauthenticated & advisor blocked on /api/admin/system-settings
      expect((await getAdminSystemSettings(buildReq("http://localhost/api/admin/system-settings"))).status).toBe(401);
      expect(
        (
          await patchAdminSystemSettings(
            buildReq("http://localhost/api/admin/system-settings", {
              method: "PATCH",
              cookie: advisor.cookieHeader,
              body: { bypassCompanyEmailRequirement: true },
            }),
          )
        ).status,
      ).toBe(403);

      // Initial system-status has bypassCompanyEmailRequirement === false
      const statusBeforeRes = await getSystemStatus(buildReq("http://localhost/api/system-status"));
      expect(statusBeforeRes.status).toBe(200);
      expect((await statusBeforeRes.json()).data.bypassCompanyEmailRequirement).toBe(false);

      // Admin updates system-settings -> bypassCompanyEmailRequirement: true
      const patchRes = await patchAdminSystemSettings(
        buildReq("http://localhost/api/admin/system-settings", {
          method: "PATCH",
          cookie: admin.cookieHeader,
          body: { bypassCompanyEmailRequirement: true, maintenanceMode: true },
        }),
      );
      expect(patchRes.status).toBe(200);
      const patchJson = await patchRes.json();
      expect(patchJson.data.settings.bypassCompanyEmailRequirement).toBe(true);
      expect(patchJson.data.settings.maintenanceMode).toBe(true);

      // GET /api/admin/system-settings & GET /api/system-status reflect updated value
      const getAdminSettingsRes = await getAdminSystemSettings(
        buildReq("http://localhost/api/admin/system-settings", { cookie: admin.cookieHeader }),
      );
      expect((await getAdminSettingsRes.json()).data.settings.bypassCompanyEmailRequirement).toBe(true);

      const statusAfterRes = await getSystemStatus(buildReq("http://localhost/api/system-status"));
      expect(statusAfterRes.status).toBe(200);
      expect((await statusAfterRes.json()).data.bypassCompanyEmailRequirement).toBe(true);
    });

    it("GET /api/admin/doors, /api/admin/products, /api/admin/payments/*, /api/admin/suspicious-activity & POST /api/admin/unblock-ip/[ip]", async () => {
      const advisor = await createAuthenticatedSession({
        id: "berater-adm-check",
        email: "berater.adm@pycie.com",
        name: "Berater",
        role: "berater",
      });
      const admin = await createAuthenticatedSession({
        id: "admin-adm-check",
        email: "admin.adm@pycie.com",
        name: "Admin",
        role: "admin",
      });

      const getHandlers: Array<{ name: string; fn: (req: Request) => Promise<Response>; url: string }> = [
        { name: "doors", fn: getAdminDoors, url: "http://localhost/api/admin/doors?startDate=2020-01-01" },
        { name: "products", fn: getAdminProducts, url: "http://localhost/api/admin/products?startDate=2020-01-01" },
        { name: "revenue-stats", fn: getAdminRevenueStats, url: "http://localhost/api/admin/payments/revenue-stats" },
        { name: "unresolved", fn: getAdminUnresolvedPayments, url: "http://localhost/api/admin/payments/unresolved" },
        {
          name: "suspicious-activity",
          fn: getAdminSuspiciousActivity,
          url: "http://localhost/api/admin/suspicious-activity",
        },
      ];

      for (const h of getHandlers) {
        expect((await h.fn(buildReq(h.url))).status).toBe(401);
        expect((await h.fn(buildReq(h.url, { cookie: advisor.cookieHeader }))).status).toBe(403);
        const okRes = await h.fn(buildReq(h.url, { cookie: admin.cookieHeader }));
        expect(okRes.status).toBe(200);
        expect((await okRes.json()).success).toBe(true);
      }

      // POST /api/admin/unblock-ip/[ip]
      expect(
        (
          await postAdminUnblockIp(buildReq("http://localhost/api/admin/unblock-ip/203.0.113.55", { method: "POST" }), {
            params: Promise.resolve({ ip: "203.0.113.55" }),
          })
        ).status,
      ).toBe(401);
      expect(
        (
          await postAdminUnblockIp(
            buildReq("http://localhost/api/admin/unblock-ip/203.0.113.55", {
              method: "POST",
              cookie: advisor.cookieHeader,
            }),
            { params: Promise.resolve({ id: "203.0.113.55", ip: "203.0.113.55" }) },
          )
        ).status,
      ).toBe(403);

      const unblockRes = await postAdminUnblockIp(
        buildReq("http://localhost/api/admin/unblock-ip/203.0.113.55", {
          method: "POST",
          cookie: admin.cookieHeader,
        }),
        { params: Promise.resolve({ ip: "203.0.113.55" }) },
      );
      expect(unblockRes.status).toBe(200);
      expect((await unblockRes.json()).data).toEqual({ unblocked: true });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PART 5: Security, Whitelist & Consent API Routes
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Part 5: Direct Route-Handler Tests — /api/security/[[...slug]], /api/whitelist/pending & /api/consent", () => {
    it("GET/POST/DELETE /api/security/[[...slug]] & GET /api/whitelist/pending (including CSV export)", async () => {
      const advisor = await createAuthenticatedSession({
        id: "berater-sec",
        email: "berater.sec@pycie.com",
        name: "Berater Sec",
        role: "berater",
      });
      const secAdmin = await createAuthenticatedSession({
        id: "admin-sec",
        email: "admin.sec@pycie.com",
        name: "Admin Sec",
        role: "admin",
      });

      // 1. Auth & capability checks on /api/security and /api/whitelist/pending
      expect(
        (await getSecurity(buildReq("http://localhost/api/security/ddos/stats"), { params: Promise.resolve({ slug: ["ddos", "stats"] }) }))
          .status,
      ).toBe(401);
      expect(
        (
          await getSecurity(
            buildReq("http://localhost/api/security/ddos/stats", { cookie: advisor.cookieHeader }),
            { params: Promise.resolve({ slug: ["ddos", "stats"] }) },
          )
        ).status,
      ).toBe(403);
      expect((await getWhitelistPending(buildReq("http://localhost/api/whitelist/pending"))).status).toBe(401);
      expect(
        (
          await getWhitelistPending(
            buildReq("http://localhost/api/whitelist/pending", { cookie: advisor.cookieHeader }),
          )
        ).status,
      ).toBe(403);

      // 2. GET all security dashboard sub-endpoints
      const slugs: string[][] = [
        ["ddos", "stats"],
        ["ddos", "blacklist"],
        ["whitelist"],
        ["login-attempts"],
        ["alerts"],
        ["honeypot", "intruders"],
        ["audit-log"],
      ];
      for (const slug of slugs) {
        const res = await getSecurity(
          buildReq(`http://localhost/api/security/${slug.join("/")}`, { cookie: secAdmin.cookieHeader }),
          { params: Promise.resolve({ slug }) },
        );
        expect(res.status).toBe(200);
        expect((await res.json()).success).toBe(true);
      }

      // Unknown security slug -> 404
      const unknownSlugRes = await getSecurity(
        buildReq("http://localhost/api/security/unknown-subroute", { cookie: secAdmin.cookieHeader }),
        { params: Promise.resolve({ slug: ["unknown-subroute"] }) },
      );
      expect(unknownSlugRes.status).toBe(404);

      // 3. CSV export on /api/security/audit-log/export
      const csvRes = await getSecurity(
        buildReq("http://localhost/api/security/audit-log/export?category=all", { cookie: secAdmin.cookieHeader }),
        { params: Promise.resolve({ slug: ["audit-log", "export"] }) },
      );
      expect(csvRes.status).toBe(200);
      expect(csvRes.headers.get("content-type")).toContain("text/csv");
      const csvText = await csvRes.text();
      expect(csvText).toContain('"Zeit";"Bereich";"Aktion";"Akteur";"IP";"Ziel"');

      // 3b. DELETE /api/security/audit-log/cleanup & DELETE /api/security/audit-log/[id]
      const cleanupAuditRes = await deleteSecurity(
        buildReq("http://localhost/api/security/audit-log/cleanup?daysOld=30", {
          method: "DELETE",
          cookie: secAdmin.cookieHeader,
        }),
        { params: Promise.resolve({ slug: ["audit-log", "cleanup"] }) },
      );
      expect(cleanupAuditRes.status).toBe(200);

      const delAuditRes = await deleteSecurity(
        buildReq("http://localhost/api/security/audit-log/audit-1", {
          method: "DELETE",
          cookie: secAdmin.cookieHeader,
        }),
        { params: Promise.resolve({ slug: ["audit-log", "audit-1"] }) },
      );
      expect(delAuditRes.status).toBe(200);

      // 4. POST /api/security/ddos/block & DELETE /api/security/ddos/unblock/[ip]
      const blockIpRes = await postSecurity(
        buildReq("http://localhost/api/security/ddos/block", {
          method: "POST",
          cookie: secAdmin.cookieHeader,
          body: { ip: "198.51.100.77", reason: "Brute-Force", permanent: true },
        }),
        { params: Promise.resolve({ slug: ["ddos", "block"] }) },
      );
      expect(blockIpRes.status).toBe(200);

      const delIpRes = await deleteSecurity(
        buildReq("http://localhost/api/security/ddos/unblock/198.51.100.77", {
          method: "DELETE",
          cookie: secAdmin.cookieHeader,
        }),
        { params: Promise.resolve({ slug: ["ddos", "unblock", "198.51.100.77"] }) },
      );
      expect(delIpRes.status).toBe(200);

      // 5. POST /api/security/whitelist, GET /api/whitelist/pending & DELETE /api/security/whitelist/[ip]
      const addWlRes = await postSecurity(
        buildReq("http://localhost/api/security/whitelist", {
          method: "POST",
          cookie: secAdmin.cookieHeader,
          body: { ip: "192.0.2.88", comment: "Filiale Köln" },
        }),
        { params: Promise.resolve({ slug: ["whitelist"] }) },
      );
      expect(addWlRes.status).toBe(200);
      expect((await addWlRes.json()).data).toEqual({ added: true });

      const pendingWlRes = await getWhitelistPending(
        buildReq("http://localhost/api/whitelist/pending", { cookie: secAdmin.cookieHeader }),
      );
      expect(pendingWlRes.status).toBe(200);
      const pendingWlJson = await pendingWlRes.json();
      expect(pendingWlJson.data.some((w: { ip: string }) => w.ip === "192.0.2.88")).toBe(true);

      const delWlRes = await deleteSecurity(
        buildReq("http://localhost/api/security/whitelist/192.0.2.88", {
          method: "DELETE",
          cookie: secAdmin.cookieHeader,
        }),
        { params: Promise.resolve({ slug: ["whitelist", "192.0.2.88"] }) },
      );
      expect(delWlRes.status).toBe(200);
      expect((await delWlRes.json()).data).toEqual({ removed: true });

      // 6. POST /api/security/alerts/[id]/acknowledge & /api/security/honeypot/intruders/[id]/report & /api/security/unlock-ip/[ip]
      const ackRes = await postSecurity(
        buildReq("http://localhost/api/security/alerts/alert-1/acknowledge", {
          method: "POST",
          cookie: secAdmin.cookieHeader,
        }),
        { params: Promise.resolve({ slug: ["alerts", "alert-1", "acknowledge"] }) },
      );
      expect(ackRes.status).toBe(200);

      const reportRes = await postSecurity(
        buildReq("http://localhost/api/security/honeypot/intruders/intruder-1/report", {
          method: "POST",
          cookie: secAdmin.cookieHeader,
        }),
        { params: Promise.resolve({ slug: ["honeypot", "intruders", "intruder-1", "report"] }) },
      );
      expect(reportRes.status).toBe(200);

      const unlockLoginIpRes = await postSecurity(
        buildReq("http://localhost/api/security/unlock-ip/198.51.100.23", {
          method: "POST",
          cookie: secAdmin.cookieHeader,
        }),
        { params: Promise.resolve({ slug: ["unlock-ip", "198.51.100.23"] }) },
      );
      expect(unlockLoginIpRes.status).toBe(200);
    });

    it("POST & GET /api/consent allows public consent recording (201) and restricts listing to admin:security (401/403/200)", async () => {
      const advisor = await createAuthenticatedSession({
        id: "berater-consent",
        email: "consent.berater@pycie.com",
        name: "Berater Consent",
        role: "berater",
      });
      const secAdmin = await createAuthenticatedSession({
        id: "admin-consent",
        email: "consent.admin@pycie.com",
        name: "Admin Consent",
        role: "admin",
      });

      // Public POST /api/consent -> 201
      const recordRes = await postConsent(
        buildReq("http://localhost/api/consent", {
          method: "POST",
          body: {
            version: "2026-04",
            analytics: true,
            marketing: false,
          },
        }),
      );
      expect(recordRes.status).toBe(201);
      const recordJson = await recordRes.json();
      expect(recordJson.success).toBe(true);
      expect(recordJson.data.id).toBeTruthy();

      // GET /api/consent: unauthenticated -> 401, advisor -> 403, security admin -> 200
      expect((await getConsent(buildReq("http://localhost/api/consent"))).status).toBe(401);
      expect(
        (await getConsent(buildReq("http://localhost/api/consent", { cookie: advisor.cookieHeader }))).status,
      ).toBe(403);

      const listRes = await getConsent(
        buildReq("http://localhost/api/consent", { cookie: secAdmin.cookieHeader }),
      );
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json();
      expect(listJson.data.some((c: { id: string }) => c.id === recordJson.data.id)).toBe(true);
    });
  });
});
