import type { ApiResponse } from "@visit-flow/shared/api";

const API_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Einziger Weg, mit der API zu sprechen. Liefert immer eine ApiResponse,
 * auch bei Netzwerkfehlern (Funkloch), damit kein Aufrufer try/catch braucht.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
    return (await response.json()) as ApiResponse<T>;
  } catch {
    const message = "Keine Verbindung zum Server";
    return { success: false, error: message, message };
  }
}
