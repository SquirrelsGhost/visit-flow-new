import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../lib/apiClient";
import { getAccessToken, setAccessToken } from "../lib/auth/accessToken";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const authHeader = (call: unknown[]) => new Headers((call[1] as RequestInit).headers).get("Authorization");

afterEach(() => setAccessToken(null));

describe("apiRequest", () => {
  it("schickt das Access-Token mit und erneuert es bei 401 genau einmal für parallele Anfragen", async () => {
    setAccessToken("alt");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      if (path.endsWith("/auth/refresh")) return json(200, { success: true, data: { token: "neu" } });
      const token = new Headers(init?.headers).get("Authorization");
      return token === "Bearer neu" ? json(200, { success: true, data: 1 }) : json(401, { success: false, error: "x", message: "x" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const results = await Promise.all([apiRequest("/a"), apiRequest("/b")]);

    expect(results.every((result) => result.success)).toBe(true);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/auth/refresh"))).toHaveLength(1);
    expect(authHeader(fetchMock.mock.calls[0] as unknown[])).toBe("Bearer alt");
    expect(getAccessToken()).toBe("neu");
  });

  it("versucht beim Login selbst keine Erneuerung", async () => {
    const fetchMock = vi.fn(async () => json(401, { success: false, error: "falsch", message: "falsch" }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await apiRequest("/auth/login", { method: "POST" });
    expect(result.success).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("liefert im Funkloch eine Fehlerantwort statt zu werfen", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    const result = await apiRequest("/x");
    expect(result).toMatchObject({ success: false });
  });
});
