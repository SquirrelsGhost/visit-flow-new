import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

interface PortalResponse {
  url: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as { returnUrl?: unknown };
    const url = typeof body.returnUrl === "string" && body.returnUrl ? body.returnUrl : "/subscription";
    return ok<PortalResponse>({ url });
  } catch (error) {
    console.error("[POST /api/subscriptions/portal]", error);
    return err("Internal server error");
  }
}
