import { Router } from "express";
import { defineRoute, type RouteDeps } from "../../lib/http/defineRoute";

/** Lebenszeichen für Nginx und Monitoring. Verrät keine Versionen oder Interna. */
export function healthRoutes(deps: RouteDeps, pingDatabase: () => Promise<boolean>): Router {
  const router = Router();

  defineRoute(router, deps, {
    method: "get",
    path: "/",
    auth: "public",
    handler: async () => ({ status: "ok", database: (await pingDatabase()) ? "connected" : "disconnected" }),
  });

  return router;
}
