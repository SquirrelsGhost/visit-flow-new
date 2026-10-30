import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    void req.headers.get("accept");
    const teams = await TeamOrgDatabaseService.listTeams();
    return ok(teams);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/teams/public/list]", error);
    return err("Internal server error");
  }
}
