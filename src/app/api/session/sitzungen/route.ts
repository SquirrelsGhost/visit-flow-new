import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { Sitzungswachdienst, type ServerSitzungRecord } from "@/services/sicherheit/Sitzungswachdienst";

interface SitzungenListResponse {
  sitzungen: ServerSitzungRecord[];
  aktuelleSitzungId: string;
}

interface SitzungenRevokeResponse {
  widerrufen: number;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) {
      return err("Bitte melde dich an.", 401);
    }
    const sitzungen = await Sitzungswachdienst.aktiveSitzungen(user.id);
    const data: SitzungenListResponse = {
      sitzungen,
      aktuelleSitzungId: user.sessionId,
    };
    return ok(data);
  } catch (error) {
    console.error("[GET /api/session/sitzungen]", error);
    return err("Internal server error");
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) {
      return err("Bitte melde dich an.", 401);
    }
    const { searchParams } = new URL(req.url);
    const zielSitzungId = searchParams.get("id");
    if (zielSitzungId) {
      const zielSitzung = await Sitzungswachdienst.holeSitzung(zielSitzungId);
      if (!zielSitzung) {
        return ok<SitzungenRevokeResponse>({ widerrufen: 0 });
      }
      const istEigene = zielSitzung.inhaberId === user.id.toLowerCase();
      if (!istEigene && !hasPermission(user.permissions, "admin:security")) {
        return err("Keine Berechtigung für diese Sitzung.", 403);
      }
      const erfolg = await Sitzungswachdienst.widerrufe(zielSitzungId, "Einzelsitzung vom Nutzer widerrufen");
      return ok<SitzungenRevokeResponse>({ widerrufen: erfolg ? 1 : 0 });
    }
    const widerrufen = await Sitzungswachdienst.widerrufeAlleFuerInhaber(
      user.id,
      "Andere Geräte vom Nutzer abgemeldet",
      user.sessionId,
    );
    return ok<SitzungenRevokeResponse>({ widerrufen });
  } catch (error) {
    console.error("[DELETE /api/session/sitzungen]", error);
    return err("Internal server error");
  }
}
