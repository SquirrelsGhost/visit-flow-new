import type { Permission } from "@/types/permissions.types";

export type PolicyAccess = "public" | "authenticated" | Permission;

export interface RoutePolicy {
  access: PolicyAccess;
  kind: "api" | "page";
  loginPath?: string;
}

interface PolicyRule {
  methods: readonly string[] | "*";
  pattern: RegExp;
  policy: RoutePolicy;
}

const API_PUBLIC: RoutePolicy = { access: "public", kind: "api" };
const API_AUTH: RoutePolicy = { access: "authenticated", kind: "api" };
const apiPerm = (access: Permission): RoutePolicy => ({ access, kind: "api" });

const PAGE_PUBLIC: RoutePolicy = { access: "public", kind: "page" };
const PAGE_AUTH: RoutePolicy = { access: "authenticated", kind: "page", loginPath: "/login" };
const pagePerm = (access: Permission): RoutePolicy => ({ access, kind: "page", loginPath: "/login" });

/**
 * Explizite Zero-Trust-Policy-Tabelle für alle durch `src/proxy.ts` überwachten Pfade.
 * Jede Route braucht eine explizite Regel (Deny-by-default: Kein Treffer = 403 Forbidden).
 */
const POLICY_RULES: readonly PolicyRule[] = [
  // ─── 1. Öffentliche System- & Auth-Endpunkte ───────────────────────────────
  { methods: ["GET"], pattern: /^\/api\/health$/, policy: API_PUBLIC },
  { methods: ["GET"], pattern: /^\/api\/mapbox$/, policy: API_PUBLIC },
  { methods: ["GET"], pattern: /^\/api\/system-status$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/consent$/, policy: API_PUBLIC },
  { methods: ["GET"], pattern: /^\/api\/consent$/, policy: apiPerm("admin:security") },
  { methods: ["GET", "POST", "DELETE"], pattern: /^\/api\/session$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/auth\/login$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/auth\/logout$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/auth\/refresh$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/auth\/send-verification$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/auth\/verify-email$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/auth\/complete-registration$/, policy: API_PUBLIC },
  { methods: ["POST"], pattern: /^\/api\/auth\/onboard-team$/, policy: API_PUBLIC },
  { methods: ["GET"], pattern: /^\/api\/auth\/me$/, policy: API_AUTH },
  { methods: ["PATCH"], pattern: /^\/api\/auth\/change-password$/, policy: API_AUTH },
  { methods: ["PATCH"], pattern: /^\/api\/auth\/profile$/, policy: apiPerm("profile:*") },
  { methods: ["GET"], pattern: /^\/api\/auth\/partner-applications$/, policy: apiPerm("admin:*") },
  { methods: ["GET"], pattern: /^\/api\/auth\/team-members$/, policy: apiPerm("team:view") },
  { methods: ["PATCH"], pattern: /^\/api\/auth\/team-members\/[^/]+$/, policy: apiPerm("team:manage") },
  { methods: ["GET"], pattern: /^\/api\/teams\/public(\/.*)?$/, policy: API_PUBLIC },

  // ─── 2. Geschützte Session-, Sicherheits- & Admin-API-Endpunkte ────────────
  { methods: ["GET", "DELETE"], pattern: /^\/api\/session\/sitzungen$/, policy: API_AUTH },
  { methods: ["POST"], pattern: /^\/api\/session\/permissions$/, policy: apiPerm("admin:permissions") },
  { methods: ["POST"], pattern: /^\/api\/session\/sperre$/, policy: apiPerm("admin:security") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/security(\/.*)?$/, policy: apiPerm("admin:security") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/admin(\/.*)?$/, policy: apiPerm("admin:*") },
  { methods: ["GET"], pattern: /^\/api\/whitelist(\/.*)?$/, policy: apiPerm("admin:security") },

  // ─── 3. Geschützte Fach-API-Endpunkte (Hybrid-PostgreSQL Backend) ──────────
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/teams\/my-team\/licenses(\/.*)?$/, policy: apiPerm("team:licensing") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/teams(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/teamleiter(\/.*)?$/, policy: apiPerm("team:backoffice") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/strukturleiter(\/.*)?$/, policy: apiPerm("streets:struktur") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/doors\/admin(\/.*)?$/, policy: apiPerm("admin:streets") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/doors\/team(\/.*)?$/, policy: apiPerm("streets:mentor") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/doors(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/houses(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/addresses(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/visits(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/areas(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/street-assignments(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/location-tracking(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/products\/admin\/expiring$/, policy: apiPerm("admin:expiring") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/products\/[^/]+\/assign-advisor$/, policy: apiPerm("admin:expiring") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/products\/admin\/all$/, policy: apiPerm("admin:crm") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/products\/[^/]+\/battle-exclude$/, policy: apiPerm("admin:crm") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/products\/team(\/.*)?$/, policy: apiPerm("crm:team") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/products(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/abrechnung(\/.*)?$/, policy: apiPerm("abrechnung:*") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/logbook(\/.*)?$/, policy: apiPerm("logbook:*") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/challenges(\/.*)?$/, policy: apiPerm("battle:*") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/incentives(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/simulate(\/.*)?$/, policy: apiPerm("simulator:*") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/tariffs(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/copilot(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/subscriptions(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/invoices(\/.*)?$/, policy: API_AUTH },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/settings(\/.*)?$/, policy: apiPerm("settings:*") },
  { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], pattern: /^\/api\/reports(\/.*)?$/, policy: API_AUTH },

  // ─── 4. Öffentliche Seiten ─────────────────────────────────────────────────
  { methods: ["GET"], pattern: /^\/$/, policy: PAGE_PUBLIC },
  { methods: ["GET"], pattern: /^\/login$/, policy: PAGE_PUBLIC },
  { methods: ["GET"], pattern: /^\/register$/, policy: PAGE_PUBLIC },
  { methods: ["GET"], pattern: /^\/onboarding$/, policy: PAGE_PUBLIC },
  { methods: ["GET"], pattern: /^\/forgot-password$/, policy: PAGE_PUBLIC },
  { methods: ["GET"], pattern: /^\/reset-password$/, policy: PAGE_PUBLIC },

  // ─── 5. Granular geschützte Admin- & Führungs-Seiten (Capability-Based) ────
  { methods: ["GET"], pattern: /^\/security-dashboard(\/.*)?$/, policy: pagePerm("admin:security") },
  { methods: ["GET"], pattern: /^\/admin-dashboard(\/.*)?$/, policy: pagePerm("admin:dashboard") },
  { methods: ["GET"], pattern: /^\/admin-street-list(\/.*)?$/, policy: pagePerm("admin:streets") },
  { methods: ["GET"], pattern: /^\/admin-crm-overview(\/.*)?$/, policy: pagePerm("admin:crm") },
  { methods: ["GET"], pattern: /^\/expiring-contracts(\/.*)?$/, policy: pagePerm("admin:expiring") },
  { methods: ["GET"], pattern: /^\/strukturleiter-street-list(\/.*)?$/, policy: pagePerm("streets:struktur") },
  { methods: ["GET"], pattern: /^\/mentor-street-list(\/.*)?$/, policy: pagePerm("streets:mentor") },
  { methods: ["GET"], pattern: /^\/team-backoffice(\/.*)?$/, policy: pagePerm("team:backoffice") },
  { methods: ["GET"], pattern: /^\/teams(\/.*)?$/, policy: pagePerm("team:view") },
  { methods: ["GET"], pattern: /^\/teamleiter-berichte(\/.*)?$/, policy: pagePerm("team:reports") },
  { methods: ["GET"], pattern: /^\/crm-integration(\/.*)?$/, policy: pagePerm("team:crm") },
  { methods: ["GET"], pattern: /^\/partners\/dashboard(\/.*)?$/, policy: pagePerm("partner:dashboard") },

  // ─── 6. Authentifizierte Berater- & App-Seiten ─────────────────────────────
  { methods: ["GET"], pattern: /^\/dashboard(\/.*)?$/, policy: PAGE_AUTH },
  { methods: ["GET"], pattern: /^\/daily-view(\/.*)?$/, policy: pagePerm("daily:*") },
  { methods: ["GET"], pattern: /^\/daily-status(\/.*)?$/, policy: pagePerm("daily:*") },
  { methods: ["GET"], pattern: /^\/team-performance(\/.*)?$/, policy: pagePerm("team:performance") },
  { methods: ["GET"], pattern: /^\/fahrtenbuch(\/.*)?$/, policy: pagePerm("logbook:*") },
  { methods: ["GET"], pattern: /^\/crm(\/.*)?$/, policy: pagePerm("crm:own") },
  { methods: ["GET"], pattern: /^\/abrechnung(\/.*)?$/, policy: pagePerm("abrechnung:*") },
  { methods: ["GET"], pattern: /^\/provisions-simulator(\/.*)?$/, policy: pagePerm("simulator:*") },
  { methods: ["GET"], pattern: /^\/battle(\/.*)?$/, policy: pagePerm("battle:*") },
  { methods: ["GET"], pattern: /^\/statistics(\/.*)?$/, policy: pagePerm("statistics:*") },
  { methods: ["GET"], pattern: /^\/subscription(\/.*)?$/, policy: PAGE_AUTH },
  { methods: ["GET"], pattern: /^\/profile(\/.*)?$/, policy: pagePerm("profile:*") },
  { methods: ["GET"], pattern: /^\/settings(\/.*)?$/, policy: pagePerm("settings:*") },
  { methods: ["GET"], pattern: /^\/privacy-settings(\/.*)?$/, policy: pagePerm("settings:*") },
  { methods: ["GET"], pattern: /^\/pattern-analysis-demo(\/.*)?$/, policy: PAGE_AUTH },
  { methods: ["GET"], pattern: /^\/kalender(\/.*)?$/, policy: PAGE_AUTH },
  { methods: ["GET"], pattern: /^\/bereich(\/.*)?$/, policy: PAGE_AUTH },
];

export function findPolicy(method: string, pathname: string): RoutePolicy | null {
  const upper = method.toUpperCase();
  const normalizedMethod = upper === "HEAD" ? "GET" : upper;

  for (const rule of POLICY_RULES) {
    const methodMatch = rule.methods === "*" || rule.methods.includes(normalizedMethod);
    if (methodMatch && rule.pattern.test(pathname)) {
      return rule.policy;
    }
  }
  return null;
}
