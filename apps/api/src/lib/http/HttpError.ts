/** Fehler mit HTTP-Status. Wird im Error-Handler zu `err()` übersetzt. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, fields?: Record<string, string>) => new HttpError(400, message, fields);
export const unauthorized = (message = "Nicht angemeldet") => new HttpError(401, message);
export const forbidden = (message = "Keine Berechtigung") => new HttpError(403, message);
export const notFound = (message = "Nicht gefunden") => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);
