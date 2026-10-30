import { apiRequest } from "../apiClient";

/**
 * Adapter für Endpunkte, deren Aufrufer sowohl `{ success, data }` (v2 Standard via `ok()`)
 * als auch benannte Top-Level-Felder (`sales`, `doors`, `products`, `users`, `challenges`, ...) lesen.
 */
export type LegacyBody = Record<string, unknown> & { success: boolean; message?: string; error?: string };

export async function legacyRequest(path: string, init: RequestInit = {}): Promise<LegacyBody> {
  const res = (await apiRequest<unknown>(path, init)) as unknown as LegacyBody;
  if (res.success && res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
    return {
      ...(res.data as Record<string, unknown>),
      ...res,
    };
  }
  return res;
}

export const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

/** Ein Listenfeld der Antwort (`body[key]`, `body.data[key]` oder `body.data`), leer wenn es fehlt. */
export function listOf<T>(body: LegacyBody, key: string): T[] {
  if (!body.success) return [];
  if (Array.isArray(body[key])) return body[key] as T[];
  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    const nested = (body.data as Record<string, unknown>)[key];
    if (Array.isArray(nested)) return nested as T[];
  }
  if (Array.isArray(body.data)) return body.data as T[];
  return [];
}

export const messageOf = (body: LegacyBody) => body.message || body.error;
