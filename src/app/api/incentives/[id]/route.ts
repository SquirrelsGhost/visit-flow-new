import { ok, err } from "@/lib/api";
import type { Contest } from "@/lib/overview/contestTypes";
import { BattleAndContestsDatabaseService } from "@/services/BattleAndContestsDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const body = (await req.json().catch(() => ({}))) as Partial<Contest>;
    const saved = await BattleAndContestsDatabaseService.saveContest({ ...body, id });
    return ok(saved);
  } catch (error) {
    console.error("[PUT /api/incentives/[id]]", error);
    return err("Internal server error");
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const deleted = await BattleAndContestsDatabaseService.deleteContest(id);
    return ok({ deleted });
  } catch (error) {
    console.error("[DELETE /api/incentives/[id]]", error);
    return err("Internal server error");
  }
}
