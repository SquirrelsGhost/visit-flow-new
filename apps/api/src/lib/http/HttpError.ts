/** Fehler mit HTTP-Status. Wird im Error-Handler zu `err()` übersetzt. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields?: Record<string, string>,
    /** Zusätzliche Felder auf oberster Ebene, die der v1-Client liest (z. B. `whitelistStatus`). */
    readonly extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, fields?: Record<string, string>) => new HttpError(400, message, fields);
export const unauthorized = (message = "Nicht angemeldet") => new HttpError(401, message);
export const forbidden = (message = "Keine Berechtigung", extra?: Record<string, unknown>) =>
  new HttpError(403, message, undefined, extra);
export const notFound = (message = "Nicht gefunden") => new HttpError(404, message);
export const conflict = (message: string, extra?: Record<string, unknown>) => new HttpError(409, message, undefined, extra);
export const tooManyRequests = (message: string, extra?: Record<string, unknown>) =>
  new HttpError(429, message, undefined, extra);
