import { ok, err } from "@/lib/api";
import { effectiveUserPermissions, hasPermission, sanitizePermissions } from "@/lib/permissions";
import { getKontoAsync, getSessionUser, upsertSessionAccountAsync } from "@/services/sicherheit/SessionUserService";
import type { Permission } from "@/types/permissions.types";

interface PermissionsUpdateResponse {
  userId: string;
  permissions: Permission[];
}

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await getSessionUser(req);
    if (!actor || actor.banned) {
      return err("Bitte melde dich an.", 401);
    }
    if (!hasPermission(actor.permissions, "admin:permissions")) {
      return err("Keine Berechtigung (admin:permissions).", 403);
    }

    const body = (await req.json().catch(() => null)) as {
      userId?: unknown;
      email?: unknown;
      role?: unknown;
      permissions?: unknown;
    } | null;
    if (!body || typeof body !== "object") {
      return err("Ungültiger JSON-Body.", 400);
    }

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!userId) {
      return err("Bitte eine gültige Nutzer-ID angeben.", 400);
    }

    const bestehend = await getKontoAsync(userId);
    const sonderPermissions = sanitizePermissions(body.permissions);
    const konto = await upsertSessionAccountAsync({
      id: userId,
      email: typeof body.email === "string" && body.email ? body.email : (bestehend?.email ?? userId),
      name: bestehend?.name,
      role: typeof body.role === "string" && body.role ? body.role : bestehend?.role,
      roles: bestehend?.roles,
      teamId: bestehend?.teamId,
      teamName: bestehend?.teamName,
      partnerStatus: bestehend?.partnerStatus,
      permissions: sonderPermissions,
    });

    const data: PermissionsUpdateResponse = {
      userId: konto.id,
      permissions: effectiveUserPermissions(konto),
    };
    return ok(data);
  } catch (error) {
    console.error("[POST /api/session/permissions]", error);
    return err("Internal server error");
  }
}
