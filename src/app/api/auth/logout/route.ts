import { ok, err } from "@/lib/api";
import { ZeroTrustSessionService } from "@/services/sicherheit/ZeroTrustSessionService";

interface LogoutResponse {
  loggedOut: boolean;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const outcome = await ZeroTrustSessionService.terminateSession(req);
    const response = ok<LogoutResponse>({ loggedOut: true });
    if (outcome.setCookie) response.headers.set("set-cookie", outcome.setCookie);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/logout]", error);
    return err("Internal server error");
  }
}
