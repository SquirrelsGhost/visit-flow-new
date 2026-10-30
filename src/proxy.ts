import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasPermission } from "@/lib/permissions";
import { findPolicy } from "@/lib/routePolicies";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

/**
 * Next.js 16 Zero-Trust Proxy (`src/proxy.ts` — 5-Schritte-Engine):
 * 1. Deny by default: Jede Route im Matcher braucht eine explizite Policy in `routePolicies.ts`
 * 2. Public routes skip auth
 * 3. Einheitliche Session- & Echtzeit-Ban-Prüfung (`getSessionUser`)
 * 4. Granularer Capability-Check (`hasPermission(user.permissions, policy.access)`)
 * 5. Anti-Spoofing User-Header (`x-user-id`, `x-user-name`, `x-user-permissions`)
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const policy = findPolicy(req.method, pathname);

  // 1. Deny by default: keine Policy = kein Zugriff (403 Forbidden)
  if (!policy) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // 2. Öffentliche Routen im Matcher überspringen die Sitzungsprüfung
  if (policy.access === "public") {
    return NextResponse.next();
  }

  // 3. Einheitliche Session- + Echtzeit-Sperr-Prüfung
  const user = await getSessionUser(req);
  if (!user) {
    if (policy.kind === "page") {
      const loginUrl = new URL(policy.loginPath ?? "/login", req.url);
      if (loginUrl.pathname === "/login") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ success: false, error: "Bitte melde dich an." }, { status: 401 });
  }

  if (user.banned) {
    if (policy.kind === "page") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("banned", "1");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json(
      { success: false, error: user.banReason ?? "Dieses Konto ist gesperrt." },
      { status: 403 },
    );
  }

  // 4. Granularer Capability-Check (`<domain>:<action>` oder `<domain>:*`), falls gefordert
  if (policy.access !== "authenticated" && !hasPermission(user.permissions, policy.access)) {
    if (policy.kind === "page") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.json(
      { success: false, error: `Keine Berechtigung (${policy.access}).` },
      { status: 403 },
    );
  }

  // 5. Anti-Spoofing: vom Client mitgesendete x-user-* Header löschen und verifizierte Werte setzen
  const headers = new Headers(req.headers);
  headers.delete("x-user-id");
  headers.delete("x-user-name");
  headers.delete("x-user-permissions");
  headers.set("x-user-id", user.id);
  headers.set("x-user-name", user.name);
  headers.set("x-user-permissions", user.permissions.join(","));

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|wasm|woff2?)$).*)",
  ],
};
