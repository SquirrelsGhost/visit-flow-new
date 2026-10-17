import { Router } from "express";
import mongoose from "mongoose";
import { defineRoute, type RouteDeps } from "../../lib/http/defineRoute";

/** Lebenszeichen für Nginx und Monitoring. Verrät keine Versionen oder Interna. */
export function healthRoutes(deps: RouteDeps): Router {
  const router = Router();

  defineRoute(router, deps, {
    method: "get",
    path: "/",
    auth: "public",
    handler: async () => ({
      status: "ok",
      database: mongoose.connection.readyState === mongoose.ConnectionStates.connected ? "connected" : "disconnected",
    }),
  });

  return router;
}
