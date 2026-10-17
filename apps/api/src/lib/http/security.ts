import type { CorsOptions } from "cors";
import helmet from "helmet";

/** Strikte Security-Header. Die API liefert nur JSON, deshalb darf die CSP alles sperren. */
export const securityHeaders = helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "no-referrer" },
});

/**
 * CORS nur für ausdrücklich erlaubte Origins. Anfragen ohne Origin (Server-zu-Server, curl)
 * gehen durch; die Origin "null" (Sandbox-iframes, file://) wird abgelehnt (Pentest 30.07.2026).
 */
export function corsOptions(allowedOrigins: string[]): CorsOptions {
  return {
    credentials: true,
    origin(origin, callback) {
      if (origin === undefined) return callback(null, true);
      callback(null, origin !== "null" && allowedOrigins.includes(origin));
    },
  };
}
