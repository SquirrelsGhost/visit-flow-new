import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { consentIdParamsSchema, consentLogInputSchema } from "@visit-flow/shared/consentSchema";
import { defineRoute, type RouteDeps } from "../../lib/http/defineRoute";
import type { ConsentService } from "./ConsentService";

const WINDOW_MS = 15 * 60 * 1000;
const consentLimiter = rateLimit({ windowMs: WINDOW_MS, limit: 30, standardHeaders: "draft-8", legacyHeaders: false });

/** Einwilligungs-Protokoll. Öffentlich, weil der Banner vor dem Login erscheint. */
export function consentRoutes(deps: RouteDeps, service: ConsentService): Router {
  const router = Router();

  defineRoute(router, deps, {
    method: "post",
    path: "/",
    auth: "public",
    before: [consentLimiter],
    body: consentLogInputSchema,
    status: 201,
    handler: ({ body }) => service.record(body),
  });

  defineRoute(router, deps, {
    method: "get",
    path: "/:id",
    auth: "public",
    before: [consentLimiter],
    params: consentIdParamsSchema,
    handler: ({ params }) => service.history(params.id),
  });

  return router;
}
