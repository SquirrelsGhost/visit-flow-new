import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import {
  entsperreKonto,
  erhoeheSitzungsVersion,
  getKontoAsync,
  getSessionUser,
  sperreKonto,
} from "@/services/sicherheit/SessionUserService";

interface SperreResponse {
  userId: string;
  banned: boolean;
  sitzungsVersion?: number;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await getSessionUser(req);
    if (!actor || actor.banned) {
      return err("Bitte melde dich an.", 401);
    }
    if (!hasPermission(actor.permissions, "admin:security")) {
      return err("Keine Berechtigung (admin:security).", 403);
    }

    const body = (await req.json().catch(() => null)) as {
      userId?: unknown;
      aktion?: unknown;
      grund?: unknown;
    } | null;
    if (!body || typeof body !== "object") {
      return err("Ungültiger JSON-Body.", 400);
    }

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!userId) {
      return err("Bitte eine gültige Nutzer-ID angeben.", 400);
    }

    if (body.aktion === "entsperren") {
      await entsperreKonto(userId);
      const konto = await getKontoAsync(userId);
      return ok<SperreResponse>({ userId, banned: false, sitzungsVersion: konto?.sitzungsVersion ?? 1 });
    }

    if (body.aktion === "version-erhoehen") {
      const neueVersion = await erhoeheSitzungsVersion(userId);
      return ok<SperreResponse>({ userId, banned: false, sitzungsVersion: neueVersion });
    }

    const grund = typeof body.grund === "string" && body.grund.trim() ? body.grund.trim() : "Konto durch Security-Admin gesperrt";
    await sperreKonto(userId, grund);
    return ok<SperreResponse>({ userId, banned: true });
  } catch (error) {
    console.error("[POST /api/session/sperre]", error);
    return err("Internal server error");
  }
}
