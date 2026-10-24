import { Router, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { copilotChatInputSchema, copilotFeedbackSchema, copilotMemoryParamsSchema } from "@visit-flow/shared/copilotSchema";
import { defineRoute, type RouteDeps } from "../../lib/http/defineRoute";
import type { CopilotService } from "./CopilotService";

const MINUTE_MS = 60 * 1000;
/** Wie v1: 20 Fragen pro Minute reichen auch im Rollenspiel. */
const chatLimiter = rateLimit({ windowMs: MINUTE_MS, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });
const memoryLimiter = rateLimit({ windowMs: MINUTE_MS, limit: 60, standardHeaders: "draft-8", legacyHeaders: false });

function sendEvent(res: Response, event: Record<string, unknown>): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/**
 * Enes, der KI-Coach. Gleiche Pfade und Formate wie v1 (/api/copilot/...), damit Nginx den
 * Bereich umschalten kann, ohne dass die App etwas merkt. Nur für angemeldete Nutzer.
 */
export function copilotRoutes(deps: RouteDeps, service: CopilotService): Router {
  const router = Router();

  // SSE: data: {type:"token",text} … {type:"done",logId,intent,action,path} oder {type:"error",message}
  defineRoute(router, deps, {
    method: "post",
    path: "/chat-stream",
    auth: "berater",
    before: [chatLimiter],
    body: copilotChatInputSchema,
    handler: async ({ body, user, res }) => {
      // Ohne Modell ein normaler 503, damit die App auf ihr lokales Wissen umschaltet
      service.assertAvailable();
      const abort = new AbortController();
      res.on("close", () => abort.abort());
      res.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
      res.flushHeaders();
      try {
        const result = await service.chat(user, body, (text) => sendEvent(res, { type: "token", text }), abort.signal);
        sendEvent(res, { type: "done", logId: result.logId, intent: result.intent, action: result.action, path: result.path, remembered: result.remembered.length });
      } catch (error) {
        if (!abort.signal.aborted) {
          console.error("[Copilot] Stream abgebrochen:", error);
          sendEvent(res, { type: "error", message: "Enes hat gerade ein Problem. Versuch es gleich nochmal." });
        }
      }
      res.end();
    },
  });

  defineRoute(router, deps, {
    method: "post",
    path: "/chat",
    auth: "berater",
    before: [chatLimiter],
    body: copilotChatInputSchema,
    handler: async ({ body, user }) => {
      const { reply, logId, action, path } = await service.chat(user, body, () => undefined);
      return { reply, logId, action, path };
    },
  });

  defineRoute(router, deps, {
    method: "post",
    path: "/feedback",
    auth: "berater",
    before: [memoryLimiter],
    body: copilotFeedbackSchema,
    handler: ({ body, user }) => service.feedback(user, body.logId, body.feedback, body.reason),
  });

  // "Was Enes über mich weiß"
  defineRoute(router, deps, {
    method: "get",
    path: "/memory",
    auth: "berater",
    before: [memoryLimiter],
    handler: ({ user }) => service.memories(user),
  });

  defineRoute(router, deps, {
    method: "delete",
    path: "/memory/:id",
    auth: "berater",
    before: [memoryLimiter],
    params: copilotMemoryParamsSchema,
    handler: ({ params, user }) => service.forget(user, params.id),
  });

  for (const path of ["/memory", "/erase-ai-data"]) {
    defineRoute(router, deps, {
      method: path === "/memory" ? "delete" : "post",
      path,
      auth: "berater",
      before: [memoryLimiter],
      handler: ({ user }) => service.forgetAll(user),
    });
  }

  return router;
}
