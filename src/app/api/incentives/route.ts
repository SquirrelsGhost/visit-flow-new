import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { Contest } from "@/lib/overview/contestTypes";
import { BattleAndContestsDatabaseService } from "@/services/BattleAndContestsDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const list = await BattleAndContestsDatabaseService.listContests();
    return ok(list);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/incentives]", error);
    return err("Internal server error");
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as Partial<Contest>;
    const saved = await BattleAndContestsDatabaseService.saveContest(body);
    return ok(saved, 201);
  } catch (error) {
    console.error("[POST /api/incentives]", error);
    return err("Internal server error");
  }
}
