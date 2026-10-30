import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DELETE as deleteSession, GET as getSession, POST as postSession } from "../app/api/session/route";
import { POST as postPermissions } from "../app/api/session/permissions/route";
import { DELETE as deleteSitzungen, GET as getSitzungen } from "../app/api/session/sitzungen/route";
import { POST as postSperre } from "../app/api/session/sperre/route";
import { findPolicy } from "../lib/routePolicies";
import { loeseLoginPoW } from "../lib/sicherheit/botSchutzClient";
import { hashePasswort } from "../lib/sicherheit/passwortHash";
import { LoginBackoffService } from "../services/sicherheit/LoginBackoffService";
import { resetKontenFuerTests, upsertSessionAccountAsync } from "../services/sicherheit/SessionUserService";
import { Sitzungswachdienst } from "../services/sicherheit/Sitzungswachdienst";
import { LOGIN_OK, mockApi, renderLogin } from "./support/renderLogin";

function extractCookiePair(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader.split(";")[0] ?? "";
}

describe("Zero-Trust API-Routen (/api/session/*) & Login-PoW-Header", () => {
  beforeEach(() => {
    Sitzungswachdienst.resetFuerTests();
    resetKontenFuerTests();
    LoginBackoffService.resetFuerTests();
  });

  it("POST /api/session weist fehlenden PoW und Wegwerf-E-Mails ab und erstellt mit gültigem PoW eine Sitzung", async () => {
    // 1. Ohne PoW -> 400
    const noPowReq = new Request("http://localhost/api/session", {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0 Chrome/122.0" },
      body: JSON.stringify({ email: "emre@pycie.com" }),
    });
    const noPowRes = await postSession(noPowReq);
    expect(noPowRes.status).toBe(400);

    // 2. Mit gültigem PoW, aber Wegwerf-E-Mail -> 400
    const pow = await loeseLoginPoW();
    const trashReq = new Request("http://localhost/api/session", {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0 Chrome/122.0" },
      body: JSON.stringify({ email: "hacker@10minutemail.com", powTs: pow.powTs, powNonce: pow.powNonce }),
    });
    const trashRes = await postSession(trashReq);
    expect(trashRes.status).toBe(400);

    // 3. Gültiger Login -> 201 + httpOnly Set-Cookie + kanonische E-Mail + Admin-Capabilities
    const okReq = new Request("http://localhost/api/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 Chrome/122.0",
        "x-device-fingerprint": "HW-112233445566",
      },
      body: JSON.stringify({
        id: "admin-1",
        email: "E.M.R.E+vip@googlemail.com",
        name: "Emre Ak",
        role: "admin",
        powTs: pow.powTs,
        powNonce: pow.powNonce,
      }),
    });
    const okRes = await postSession(okReq);
    expect(okRes.status).toBe(201);
    const setCookie = okRes.headers.get("set-cookie");
    expect(setCookie).toContain("vf_session=");
    expect(setCookie).toContain("HttpOnly");
    const body = await okRes.json();
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("emre@gmail.com");
    expect(body.data.user.permissions).toContain("*");

    // 4. GET /api/session erkennt die Sitzung anhand des Cookies
    const cookieHeader = extractCookiePair(setCookie);
    const statusRes = await getSession(
      new Request("http://localhost/api/session", {
        headers: { cookie: cookieHeader, "user-agent": "Mozilla/5.0 Chrome/122.0" },
      }),
    );
    const statusBody = await statusRes.json();
    expect(statusBody.data.authenticated).toBe(true);
    expect(statusBody.data.user.id).toBe("admin-1");

    // 5. GET /api/session/sitzungen listet das aktive Gerät
    const sitzungenRes = await getSitzungen(
      new Request("http://localhost/api/session/sitzungen", {
        headers: { cookie: cookieHeader, "user-agent": "Mozilla/5.0 Chrome/122.0" },
      }),
    );
    const sitzungenBody = await sitzungenRes.json();
    expect(sitzungenBody.data.sitzungen).toHaveLength(1);
    expect(sitzungenBody.data.sitzungen[0].geraetFingerprint).toBe("HW-112233445566");

    // 6. POST /api/session/permissions vergibt Sonder-Capabilities an einen Berater
    const permRes = await postPermissions(
      new Request("http://localhost/api/session/permissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
          "user-agent": "Mozilla/5.0 Chrome/122.0",
        },
        body: JSON.stringify({
          userId: "berater-7",
          email: "b7@pycie.com",
          role: "berater",
          permissions: ["team:backoffice", "streets:mentor"],
        }),
      }),
    );
    const permBody = await permRes.json();
    expect(permRes.status).toBe(200);
    expect(permBody.data.permissions).toContain("team:backoffice");
    expect(permBody.data.permissions).toContain("streets:mentor");

    // 7. POST /api/session/sperre sperrt das Berater-Konto in Echtzeit und kann es per "entsperren" wieder freigeben
    const sperreRes = await postSperre(
      new Request("http://localhost/api/session/sperre", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
          "user-agent": "Mozilla/5.0 Chrome/122.0",
        },
        body: JSON.stringify({ userId: "berater-7", grund: "Verdächtige Aktivität" }),
      }),
    );
    expect(sperreRes.status).toBe(200);
    expect((await sperreRes.json()).data.banned).toBe(true);

    const entsperreRes = await postSperre(
      new Request("http://localhost/api/session/sperre", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
          "user-agent": "Mozilla/5.0 Chrome/122.0",
        },
        body: JSON.stringify({ userId: "berater-7", aktion: "entsperren" }),
      }),
    );
    expect(entsperreRes.status).toBe(200);
    expect((await entsperreRes.json()).data.banned).toBe(false);

    // 8. DELETE /api/session/sitzungen & DELETE /api/session beendet die Sitzung sauber
    const delOtherRes = await deleteSitzungen(
      new Request("http://localhost/api/session/sitzungen", {
        method: "DELETE",
        headers: { cookie: cookieHeader, "user-agent": "Mozilla/5.0 Chrome/122.0" },
      }),
    );
    expect(delOtherRes.status).toBe(200);

    const logoutRes = await deleteSession(
      new Request("http://localhost/api/session", {
        method: "DELETE",
        headers: { cookie: cookieHeader, "user-agent": "Mozilla/5.0 Chrome/122.0" },
      }),
    );
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("verhindert Konto-Übernahme passwortgeschützter Konten, IDOR beim Sitzungswiderruf und prüft granulare Route-Policies", async () => {
    await upsertSessionAccountAsync({
      id: "protected-admin",
      email: "chief@pycie.com",
      name: "Chief",
      role: "admin",
      passwordHash: hashePasswort("StrengGeheim!2026"),
    });

    const pow = await loeseLoginPoW();
    // Versuch, ein passwortgeschütztes Konto ohne Passwort über POST /api/session zu übernehmen -> 401
    const hijackRes = await postSession(
      new Request("http://localhost/api/session", {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0 Chrome/122.0" },
        body: JSON.stringify({
          id: "protected-admin",
          email: "chief@pycie.com",
          role: "admin",
          powTs: pow.powTs,
          powNonce: pow.powNonce,
        }),
      }),
    );
    expect(hijackRes.status).toBe(401);

    // IDOR-Schutz: Berater A darf fremde Sitzung von Nutzer B nicht löschen -> 403
    const fremdeSitzung = await Sitzungswachdienst.erstelleSitzung("nutzer-b", "Nutzer B", 3600);
    const beraterLoginRes = await postSession(
      new Request("http://localhost/api/session", {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0 Chrome/122.0" },
        body: JSON.stringify({
          id: "berater-a",
          email: "berater.a@pycie.com",
          role: "berater",
          powTs: pow.powTs,
          powNonce: pow.powNonce,
        }),
      }),
    );
    const beraterCookie = extractCookiePair(beraterLoginRes.headers.get("set-cookie"));
    const idorRes = await deleteSitzungen(
      new Request(`http://localhost/api/session/sitzungen?id=${fremdeSitzung.id}`, {
        method: "DELETE",
        headers: { cookie: beraterCookie, "user-agent": "Mozilla/5.0 Chrome/122.0" },
      }),
    );
    expect(idorRes.status).toBe(403);

    // Granulare Route-Policies prüfen
    expect(findPolicy("POST", "/api/consent")?.access).toBe("public");
    expect(findPolicy("GET", "/api/consent")?.access).toBe("admin:security");
    expect(findPolicy("GET", "/api/auth/partner-applications")?.access).toBe("admin:*");
    expect(findPolicy("GET", "/api/auth/team-members")?.access).toBe("team:view");
    expect(findPolicy("PATCH", "/api/auth/team-members/u-123")?.access).toBe("team:manage");
    expect(findPolicy("GET", "/api/doors/admin/all")?.access).toBe("admin:streets");
    expect(findPolicy("GET", "/api/doors/team/t-1")?.access).toBe("streets:mentor");
    expect(findPolicy("GET", "/api/products/admin/expiring")?.access).toBe("admin:expiring");
    expect(findPolicy("POST", "/api/products/p-1/assign-advisor")?.access).toBe("admin:expiring");
    expect(findPolicy("GET", "/api/products/admin/all")?.access).toBe("admin:crm");
    expect(findPolicy("PATCH", "/api/products/p-1/battle-exclude")?.access).toBe("admin:crm");
    expect(findPolicy("GET", "/api/products/team/t-1")?.access).toBe("crm:team");
    expect(findPolicy("GET", "/api/teams/my-team/licenses")?.access).toBe("team:licensing");
  });

  it("LoginForm sendet beim Anmelden automatisch PoW-Header, Hardware-Fingerprint und kanonische E-Mail mit", async () => {
    const fetchMock = mockApi({ "/auth/login": LOGIN_OK });
    renderLogin();
    await userEvent.type(screen.getByTestId("login-email"), "E.M.R.E+1@googlemail.com");
    await userEvent.type(screen.getByTestId("login-password"), "geheim");
    await userEvent.click(screen.getByTestId("login-submit"));

    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/dashboard"), {
      timeout: 4000,
    });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(Number(headers["x-pow-ts"])).toBeGreaterThan(0);
    expect(Number(headers["x-pow-nonce"])).toBeGreaterThanOrEqual(0);
    expect(headers["x-device-fingerprint"]).toMatch(/^HW-[0-9A-F]{12}$/);
    expect(headers["x-vf-fingerprint"]).toMatch(/^VF-/);
    expect(headers["x-canonical-email"]).toBe("emre@gmail.com");
  });
});
