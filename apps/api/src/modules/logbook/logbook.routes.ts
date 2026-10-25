import { Router } from "express";
import {
  logbookMonthInputSchema,
  logbookMonthParamsSchema,
  logbookProfileInputSchema,
  logbookQuerySchema,
} from "@visit-flow/shared/logbookSchema";
import { defineRoute, type RouteDeps } from "../../lib/http/defineRoute";
import type { LogbookService } from "./LogbookService";

/** Fahrtenbuch. Jede Rolle führt ihr eigenes Buch; niemand liest das Buch eines anderen. */
export function logbookRoutes(deps: RouteDeps, service: LogbookService): Router {
  const router = Router();

  defineRoute(router, deps, {
    method: "get",
    path: "/",
    auth: "berater",
    query: logbookQuerySchema,
    handler: ({ user, query }) => service.get(user.id, query.since ? new Date(query.since) : undefined),
  });

  defineRoute(router, deps, {
    method: "put",
    path: "/months/:month",
    auth: "berater",
    params: logbookMonthParamsSchema,
    body: logbookMonthInputSchema,
    handler: ({ user, params, body }) => service.saveMonth(user.id, params.month, body),
  });

  defineRoute(router, deps, {
    method: "put",
    path: "/profile",
    auth: "berater",
    body: logbookProfileInputSchema,
    handler: ({ user, body }) => service.saveProfile(user.id, body),
  });

  return router;
}
