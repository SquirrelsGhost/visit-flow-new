/**
 * Access-Token (15 Minuten) nur im Arbeitsspeicher. Anders als v1 landet es nie in
 * localStorage, wo jedes eingeschleuste Skript es lesen könnte. Nach einem Neuladen
 * holt das httpOnly-Refresh-Cookie ein neues.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
