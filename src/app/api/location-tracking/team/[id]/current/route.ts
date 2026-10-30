import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    return ok<unknown[]>([]);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/location-tracking/team/[id]/current]", error);
    return err("Internal server error");
  }
}
