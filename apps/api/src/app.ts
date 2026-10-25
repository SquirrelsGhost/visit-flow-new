import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import type { Env } from "./config/env";
import { errorHandler, notFoundHandler } from "./lib/http/errorHandler";
import { corsOptions, securityHeaders } from "./lib/http/security";
import type { AuthService } from "./modules/auth/AuthService";
import { authRoutes } from "./modules/auth/auth.routes";
import type { ConsentService } from "./modules/consent/ConsentService";
import { consentRoutes } from "./modules/consent/consent.routes";
import { healthRoutes } from "./modules/health/health.routes";
import type { LogbookService } from "./modules/logbook/LogbookService";
import { logbookRoutes } from "./modules/logbook/logbook.routes";

export interface AppServices {
  consent: ConsentService;
  auth: AuthService;
  /** Für /api/health. Ohne Angabe meldet die API die Datenbank als getrennt. */
  pingDatabase?: () => Promise<boolean>;
  /** Optional, damit Tests anderer Module es nicht mitbauen müssen. */
  logbook?: LogbookService;
}

export type AppEnv = Pick<Env, "JWT_SECRET" | "CORS_ORIGINS" | "NODE_ENV">;

/** Baut die Express-App. Hier wird nur zusammengesteckt: Middleware, Module, Fehlerbehandlung. */
export function createApp(env: AppEnv, services: AppServices): Express {
  const app = express();
  const deps = { jwtSecret: env.JWT_SECRET };

  app.disable("x-powered-by");
  // Hinter Nginx: genau ein Proxy, damit req.ip die echte Client-IP ist
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(cors(corsOptions(env.CORS_ORIGINS)));
  // Ein Monat Fahrtenbuch mit früheren Fassungen kann größer werden; nur dort gilt die höhere Grenze
  app.use("/api/logbook", express.json({ limit: "1mb" }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use("/api/health", healthRoutes(deps, services.pingDatabase ?? (async () => false)));
  app.use("/api/consent", consentRoutes(deps, services.consent));
  app.use("/api/auth", authRoutes({ ...deps, secureCookies: env.NODE_ENV === "production" }, services.auth));
  if (services.logbook) app.use("/api/logbook", logbookRoutes(deps, services.logbook));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
