import type { AuthUser } from "@/shared/auth/authSchemas";

const DEMO_KEY = "vf_demo_admin";

/**
 * Demo-Admin nur beim lokalen Entwickeln (`npm run dev`). Next ersetzt NODE_ENV beim Bauen,
 * deshalb fällt der Zugang aus jedem Produktions-Build komplett heraus.
 */
export const DEMO_LOGIN_ENABLED = process.env.NODE_ENV === "development";

export const DEMO_ADMIN: AuthUser = {
  id: "demo-admin",
  email: "admin@demo.local",
  name: "Demo Admin",
  role: "admin",
  permissions: ["*", "admin:*", "team:*", "streets:*", "crm:*", "partner:dashboard"],
};

/** Merkt sich die Demo-Sitzung im Tab, damit sie ein Neuladen übersteht. */
export function hasDemoSession(): boolean {
  if (!DEMO_LOGIN_ENABLED) return false;
  try {
    return window.sessionStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDemoSession(active: boolean): void {
  try {
    if (active) {
      window.sessionStorage.setItem(DEMO_KEY, "1");
      if (typeof document !== "undefined") {
        document.cookie = "vf_demo_session=1; path=/; SameSite=Lax";
      }
    } else {
      window.sessionStorage.removeItem(DEMO_KEY);
      if (typeof document !== "undefined") {
        document.cookie = "vf_demo_session=; path=/; Max-Age=0; SameSite=Lax";
      }
    }
  } catch {
    // ohne sessionStorage gilt die Demo-Sitzung nur bis zum Neuladen
  }
}
