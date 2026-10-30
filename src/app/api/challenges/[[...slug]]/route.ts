import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { Vertical } from "@/lib/battle/battleCategories";
import type { AutoAssignMode, PointConfig } from "@/lib/battle/battleTypes";
import { BattleAndContestsDatabaseService } from "@/services/BattleAndContestsDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { slug = [] } = await context.params;
    const path = slug.join("/");
    const url = new URL(req.url);
    const vertical = (url.searchParams.get("vertical") as Vertical) || "telco";
    const snap = await BattleAndContestsDatabaseService.getSnapshot(vertical);

    if (path === "my") return ok({ challenges: snap.myChallenges });
    if (path === "active") return ok({ challenges: snap.activeBattles });
    if (path === "completed") return ok({ challenges: snap.completedBattles });
    if (path === "battle-readiness") return ok(snap.readiness);
    if (path === "top-earners") return ok({ topEarners: snap.topEarners });
    if (path === "streaks") return ok({ streaks: snap.streaks });
    if (path === "point-config") return ok({ points: snap.points });
    if (path === "auto-assign-status") {
      const status = await BattleAndContestsDatabaseService.getAutoAssignStatus();
      return ok(status);
    }
    if (path === "admin/all") {
      const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
      const admin = await BattleAndContestsDatabaseService.getAdminBattles(date);
      return ok(admin.data);
    }
    return ok(snap);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/challenges/[[...slug]]]", error);
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
    const { slug = [] } = await context.params;
    const path = slug.join("/");
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    if (path === "") {
      const created = await BattleAndContestsDatabaseService.createChallenge(
        user.id,
        String(body.opponentId ?? ""),
      );
      return ok(created, 201);
    }
    if (path === "manual-assign") {
      const created = await BattleAndContestsDatabaseService.createChallenge(
        String(body.challengerId ?? ""),
        String(body.opponentId ?? ""),
      );
      return ok(created, 201);
    }
    if (path === "trigger-auto-assign") {
      return ok({ assigned: true });
    }
    if (path === "reset-streaks") {
      return ok(await BattleAndContestsDatabaseService.resetStreaks());
    }
    if (path === "auto-assign-toggle") {
      const updated = await BattleAndContestsDatabaseService.updateAutoAssign({
        enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
        mode: typeof body.mode === "string" ? (body.mode as AutoAssignMode) : undefined,
      });
      return ok(updated);
    }
    if (slug[1] === "sick") {
      return ok({ markedSick: true });
    }
    return ok({ ok: true });
  } catch (error) {
    console.error("[POST /api/challenges/[[...slug]]]", error);
    return err("Internal server error");
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { slug = [] } = await context.params;
    if (slug.join("/") === "point-config") {
      const body = (await req.json().catch(() => ({}))) as { points?: PointConfig; vertical?: Vertical };
      if (!body.points) return err("points fehlt", 400);
      const res = await BattleAndContestsDatabaseService.savePointConfig(body.vertical ?? "telco", body.points);
      return ok(res);
    }
    return ok({ updated: true });
  } catch (error) {
    console.error("[PUT /api/challenges/[[...slug]]]", error);
    return err("Internal server error");
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { slug = [] } = await context.params;
    if (slug.length === 2 && slug[1] === "respond") {
      const body = (await req.json().catch(() => ({}))) as { action?: unknown };
      const action = body.action === "decline" ? "decline" : "accept";
      const updated = await BattleAndContestsDatabaseService.respondChallenge(slug[0]!, action);
      return ok({ challenge: updated });
    }
    return ok({ updated: true });
  } catch (error) {
    console.error("[PATCH /api/challenges/[[...slug]]]", error);
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
    const { slug = [] } = await context.params;
    if (slug.length === 2 && slug[1] === "cancel") {
      const res = await BattleAndContestsDatabaseService.cancelChallenge(slug[0]!);
      return ok(res);
    }
    return ok({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/challenges/[[...slug]]]", error);
    return err("Internal server error");
  }
}
