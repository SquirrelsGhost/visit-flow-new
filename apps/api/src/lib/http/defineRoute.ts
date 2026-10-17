import type { Request, RequestHandler, Response, Router } from "express";
import type { z } from "zod";
import { hasRoleAtLeast, type Role } from "@visit-flow/shared/roles";
import { bearerToken, verifyAccessToken, type AuthUser } from "../auth/accessToken";
import { badRequest, forbidden, unauthorized } from "./HttpError";
import { ok } from "./response";

type Method = "get" | "post" | "put" | "patch" | "delete";

/** "public" muss ausdrücklich gesetzt werden: Kein Endpunkt ist versehentlich offen. */
export type RouteAuth = "public" | Role;

export interface RouteContext<TBody, TQuery, TParams, TAuth extends RouteAuth> {
  body: TBody;
  query: TQuery;
  params: TParams;
  user: TAuth extends "public" ? AuthUser | null : AuthUser;
  req: Request;
  res: Response;
}

export interface RouteDefinition<TBody, TQuery, TParams, TAuth extends RouteAuth, TResult> {
  method: Method;
  path: string;
  /** Mindestrolle, oder "public" für Endpunkte ohne Login. */
  auth: TAuth;
  body?: z.ZodType<TBody>;
  query?: z.ZodType<TQuery>;
  params?: z.ZodType<TParams>;
  /** HTTP-Status bei Erfolg, Standard 200. */
  status?: number;
  /** Läuft vor Auth und Validierung, z. B. ein Rate-Limit. */
  before?: RequestHandler[];
  handler: (ctx: RouteContext<TBody, TQuery, TParams, TAuth>) => Promise<TResult>;
}

export interface RouteDeps {
  jwtSecret: string;
}

function parse<T>(schema: z.ZodType<T> | undefined, value: unknown, part: string): T {
  if (!schema) return undefined as T;
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const fields = Object.fromEntries(result.error.issues.map((issue) => [issue.path.join(".") || part, issue.message]));
  throw badRequest(`Ungültige Eingabe (${part})`, fields);
}

function resolveUser(req: Request, auth: RouteAuth, jwtSecret: string): AuthUser | null {
  const token = bearerToken(req.headers.authorization);
  const user = token ? verifyAccessToken(token, jwtSecret) : null;
  if (auth === "public") return user;
  if (!user) throw unauthorized();
  if (!hasRoleAtLeast(user.role, auth)) throw forbidden();
  return user;
}

/**
 * Registriert einen Endpunkt: prüft Login und Rolle, validiert Body, Query und Params mit Zod
 * und antwortet mit ok(). Fehler (auch aus dem Handler) landen im zentralen Error-Handler.
 * Routen enthalten keine Geschäftslogik, der Handler ruft nur einen Service auf.
 */
export function defineRoute<TBody = undefined, TQuery = undefined, TParams = undefined, TAuth extends RouteAuth = RouteAuth, TResult = unknown>(
  router: Router,
  deps: RouteDeps,
  def: RouteDefinition<TBody, TQuery, TParams, TAuth, TResult>,
): void {
  router[def.method](def.path, ...(def.before ?? []), async (req: Request, res: Response) => {
    const user = resolveUser(req, def.auth, deps.jwtSecret);
    const ctx = {
      body: parse(def.body, req.body, "body"),
      query: parse(def.query, req.query, "query"),
      params: parse(def.params, req.params, "params"),
      user,
      req,
      res,
    } as RouteContext<TBody, TQuery, TParams, TAuth>;
    const result = await def.handler(ctx);
    if (!res.headersSent) ok(res, result, def.status ?? 200);
  });
}
