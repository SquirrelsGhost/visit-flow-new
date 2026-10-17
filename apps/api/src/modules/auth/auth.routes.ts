import { Router, type Request } from "express";
import { rateLimit } from "express-rate-limit";
import { loginInputSchema } from "@visit-flow/shared/auth";
import { defineRoute, type RouteDeps } from "../../lib/http/defineRoute";
import { unauthorized } from "../../lib/http/HttpError";
import type { AuthService, ClientInfo } from "./AuthService";
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from "./refreshCookie";

const WINDOW_MS = 15 * 60 * 1000;
const limiter = (limit: number) => rateLimit({ windowMs: WINDOW_MS, limit, standardHeaders: "draft-8", legacyHeaders: false });
const loginLimiter = limiter(20);
const refreshLimiter = limiter(120);

export interface AuthRouteDeps extends RouteDeps {
  /** Cookie nur über HTTPS, in Produktion immer. */
  secureCookies: boolean;
}

// req.ip berücksichtigt `trust proxy`, ein selbst gesetzter X-Forwarded-For-Header zählt nicht
const clientInfo = (req: Request): ClientInfo => ({ ip: req.ip ?? "unbekannt", userAgent: req.get("user-agent") });

/** Login, Refresh, Logout und Profil, kompatibel mit dem v1-Client (gleiche Pfade, Felder und Cookies). */
export function authRoutes(deps: AuthRouteDeps, service: AuthService): Router {
  const router = Router();

  defineRoute(router, deps, {
    method: "post",
    path: "/login",
    auth: "public",
    before: [loginLimiter],
    body: loginInputSchema,
    async handler({ body, req, res }) {
      const { refreshToken, ...result } = await service.login(body, clientInfo(req));
      setRefreshCookie(res, refreshToken, deps.secureCookies);
      return result;
    },
  });

  defineRoute(router, deps, {
    method: "post",
    path: "/refresh",
    auth: "public",
    before: [refreshLimiter],
    async handler({ req, res }) {
      const raw = readRefreshCookie(req);
      if (!raw) throw unauthorized("Keine Sitzung");
      try {
        const { refreshToken, token } = await service.refresh(raw, clientInfo(req));
        setRefreshCookie(res, refreshToken, deps.secureCookies);
        return { token };
      } catch (error) {
        clearRefreshCookie(res, deps.secureCookies);
        throw error;
      }
    },
  });

  defineRoute(router, deps, {
    method: "post",
    path: "/logout",
    auth: "public",
    async handler({ req, res }) {
      try {
        await service.logout(readRefreshCookie(req));
      } finally {
        clearRefreshCookie(res, deps.secureCookies);
      }
      return { loggedOut: true };
    },
  });

  for (const path of ["/me", "/profile"]) {
    defineRoute(router, deps, {
      method: "get",
      path,
      auth: "berater",
      handler: ({ user }) => service.profile(user.id),
    });
  }

  return router;
}
