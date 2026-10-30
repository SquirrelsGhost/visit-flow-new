import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import type { AuditCategory } from "@/lib/security/securityTypes";
import { SecurityDashboardDatabaseService } from "@/services/SecurityDashboardDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:security")) return err("Keine Berechtigung.", 403);
    const { slug = [] } = await context.params;
    const path = slug.join("/");
    const url = new URL(req.url);

    if (path === "ddos/stats") return ok(await SecurityDashboardDatabaseService.getDdosStats());
    if (path === "ddos/blacklist") return ok(await SecurityDashboardDatabaseService.getBlacklist());
    if (path === "whitelist") return ok(await SecurityDashboardDatabaseService.getWhitelist());
    if (path === "login-attempts") return ok(await SecurityDashboardDatabaseService.getLoginAttempts());
    if (path === "alerts") return ok(await SecurityDashboardDatabaseService.getAlerts());
    if (path === "honeypot/intruders") return ok(await SecurityDashboardDatabaseService.getHoneypotIntruders());
    if (path === "audit-log" || path === "audit-log/count") {
      const category = (url.searchParams.get("category") ?? "all") as AuditCategory | "all";
      const query = url.searchParams.get("actorEmail") ?? "";
      const res = await SecurityDashboardDatabaseService.listAuditLogs({ category, query });
      return ok(res);
    }
    if (path === "audit-log/export") {
      const category = url.searchParams.get("category") ?? "all";
      const csv = await SecurityDashboardDatabaseService.exportAuditCsv(category);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="audit-log.csv"',
        },
      });
    }
    return err("Unbekannter Sicherheits-Endpunkt", 404);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/security/[[...slug]]]", error);
    return err("Internal server error");
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:security")) return err("Keine Berechtigung.", 403);
    const { slug = [] } = await context.params;
    const path = slug.join("/");
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    if (path === "ddos/block") {
      return ok(
        await SecurityDashboardDatabaseService.blockIp(
          String(body.ip ?? ""),
          String(body.reason ?? "Manuelle Sperre"),
          Boolean(body.permanent),
        ),
      );
    }
    if (path === "whitelist") {
      return ok(
        await SecurityDashboardDatabaseService.addWhitelist(
          String(body.ip ?? ""),
          String(body.comment ?? ""),
          user.email ?? "admin@pycie.com",
        ),
      );
    }
    if (slug[0] === "unlock-ip" && slug[1]) {
      return ok(await SecurityDashboardDatabaseService.unlockLoginIp(decodeURIComponent(slug[1])));
    }
    if (slug[0] === "alerts" && slug[1] && slug[2] === "acknowledge") {
      return ok(await SecurityDashboardDatabaseService.acknowledgeAlert(decodeURIComponent(slug[1])));
    }
    if (slug[0] === "honeypot" && slug[1] === "intruders" && slug[2] && slug[3] === "report") {
      return ok(await SecurityDashboardDatabaseService.reportIntruder(decodeURIComponent(slug[2])));
    }
    return ok({ ok: true });
  } catch (error) {
    console.error("[POST /api/security/[[...slug]]]", error);
    return err("Internal server error");
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:security")) return err("Keine Berechtigung.", 403);
    const { slug = [] } = await context.params;
    const url = new URL(req.url);
    if (slug[0] === "ddos" && slug[1] === "unblock" && slug[2]) {
      return ok(await SecurityDashboardDatabaseService.unblockIp(decodeURIComponent(slug[2])));
    }
    if (slug[0] === "whitelist" && slug[1]) {
      return ok(await SecurityDashboardDatabaseService.removeWhitelist(decodeURIComponent(slug[1])));
    }
    if (slug[0] === "audit-log" && slug[1] === "cleanup") {
      const daysOld = Number(url.searchParams.get("daysOld")) || 30;
      return ok(await SecurityDashboardDatabaseService.cleanupAuditLogs(daysOld));
    }
    if (slug[0] === "audit-log" && slug[1]) {
      return ok(await SecurityDashboardDatabaseService.deleteAuditLog(decodeURIComponent(slug[1])));
    }
    return ok({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/security/[[...slug]]]", error);
    return err("Internal server error");
  }
}
