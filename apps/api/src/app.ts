import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import type { Env } from "./config/env";
import { errorHandler, notFoundHandler } from "./lib/http/errorHandler";
import { corsOptions, securityHeaders } from "./lib/http/security";
import { consentLogModel } from "./modules/consent/ConsentLog.model";
import { mongoConsentRepository } from "./modules/consent/ConsentRepository";
import { ConsentService } from "./modules/consent/ConsentService";
import { consentRoutes } from "./modules/consent/consent.routes";
import { healthRoutes } from "./modules/health/health.routes";

export interface AppServices {
  consent: ConsentService;
}

export function createServices(env: Env): AppServices {
  return {
    consent: new ConsentService(mongoConsentRepository(consentLogModel(env.CONSENT_LOG_DAYS))),
  };
}

/** Baut die Express-App. Hier wird nur zusammengesteckt: Middleware, Module, Fehlerbehandlung. */
export function createApp(env: Pick<Env, "JWT_SECRET" | "CORS_ORIGINS">, services: AppServices): Express {
  const app = express();
  const deps = { jwtSecret: env.JWT_SECRET };

  app.disable("x-powered-by");
  // Hinter Nginx: genau ein Proxy, damit req.ip die echte Client-IP ist
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(cors(corsOptions(env.CORS_ORIGINS)));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use("/api/health", healthRoutes(deps));
  app.use("/api/consent", consentRoutes(deps, services.consent));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
