import type { ApiResponse } from "@visit-flow/shared/api";
import type { RefreshResponse } from "@visit-flow/shared/auth";
import { getAccessToken, setAccessToken } from "./auth/accessToken";

/** Leer = gleicher Ursprung; Next leitet /api an die API weiter. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const NETWORK_ERROR = "Verbindung zum Server fehlgeschlagen. Bitte prüfe deine Internetverbindung.";

/** Anfragen, bei denen ein 401 kein abgelaufenes Token bedeutet. */
const NO_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"];

let refreshing: Promise<boolean> | null = null;

async function send<T>(path: string, init: RequestInit): Promise<{ status: number; body: ApiResponse<T> }> {
  const token = getAccessToken();
  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    return { status: response.status, body: (await response.json()) as ApiResponse<T> };
  } catch {
    return { status: 0, body: { success: false, error: NETWORK_ERROR, message: NETWORK_ERROR } };
  }
}

/**
 * Holt mit dem Refresh-Cookie ein neues Access-Token. Laufen mehrere Anfragen gleichzeitig
 * in einen 401, wird trotzdem nur einmal erneuert (sonst würde die Token-Kette als
 * wiederverwendet gelten und der Server alle Sitzungen beenden).
 */
export function refreshAccessToken(): Promise<boolean> {
  refreshing ??= send<RefreshResponse>("/auth/refresh", { method: "POST" })
    .then(({ body }) => {
      setAccessToken(body.success ? body.data.token : null);
      return body.success;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/**
 * Einziger Weg, mit der API zu sprechen. Liefert immer eine ApiResponse,
 * auch bei Netzwerkfehlern (Funkloch), damit kein Aufrufer try/catch braucht.
 * Ein abgelaufenes Access-Token wird einmal still erneuert.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const first = await send<T>(path, init);
  const canRetry = first.status === 401 && getAccessToken() !== null && !NO_REFRESH.includes(path);
  if (!canRetry || !(await refreshAccessToken())) return first.body;
  return (await send<T>(path, init)).body;
}
