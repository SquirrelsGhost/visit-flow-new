import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "./HttpError";
import { err } from "./response";

export const notFoundHandler: RequestHandler = (_req, res) => {
  err(res, "Endpunkt nicht gefunden", 404);
};

/** Letzte Station für alle Fehler. Interne Details gehen ins Log, nie an den Client. */
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    err(res, error.message, error.status, error.fields, error.extra);
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    err(res, "Ungültiges JSON", 400);
    return;
  }
  console.error("[API] Unerwarteter Fehler:", error);
  err(res, "Interner Fehler", 500);
};
