/**
 * Einheitliches Antwortformat für jeden API-Endpunkt.
 *
 * `message` spiegelt `error`, damit der v1-Client während des Parallelbetriebs
 * Fehlermeldungen weiter lesen kann (v1 liest `message`, v2 liest `error`).
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  /** Feldfehler aus der Validierung, z. B. { email: "Ungültige E-Mail" }. */
  fields?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success;
}
