import type { Response } from "express";
import type { ApiError, ApiSuccess } from "@visit-flow/shared/api";

/** Erfolgsantwort { success: true, data }. Jeder Endpunkt antwortet nur über ok() oder err(). */
export function ok<T>(res: Response, data: T, status = 200): Response<ApiSuccess<T>> {
  return res.status(status).json({ success: true, data });
}

/**
 * Fehlerantwort { success: false, error, message }. `message` hält den v1-Client kompatibel,
 * `extra` trägt Felder wie `whitelistStatus`, die er auf oberster Ebene erwartet.
 */
export function err(
  res: Response,
  message: string,
  status = 500,
  fields?: Record<string, string>,
  extra?: Record<string, unknown>,
): Response<ApiError> {
  const body: ApiError = { ...extra, success: false, error: message, message };
  if (fields) body.fields = fields;
  return res.status(status).json(body);
}
