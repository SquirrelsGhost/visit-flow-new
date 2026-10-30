import { ok, err } from "@/lib/api";
import {
  ZeroTrustSessionService,
  type EstablishSessionInput,
  type SessionStatusResponse,
} from "@/services/sicherheit/ZeroTrustSessionService";
import type { SessionUser } from "@/services/sicherheit/SessionUserService";

interface EstablishSessionResponse {
  user: SessionUser;
}

interface TerminateSessionResponse {
  loggedOut: true;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const result = await ZeroTrustSessionService.inspectSession(req);
    if (!result.ok) {
      return err(result.error, result.status);
    }
    const response = ok<SessionStatusResponse>(result.data);
    if (result.setCookie) {
      response.headers.set("Set-Cookie", result.setCookie);
    }
    return response;
  } catch (error) {
    console.error("[GET /api/session]", error);
    return err("Internal server error");
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as EstablishSessionInput | null;
    if (!body || typeof body !== "object") {
      return err("Ungültiger JSON-Body.", 400);
    }
    const result = await ZeroTrustSessionService.establishSession(req, body);
    if (!result.ok) {
      return err(result.error, result.status);
    }
    const response = ok<EstablishSessionResponse>(result.data, result.status ?? 201);
    if (result.setCookie) {
      response.headers.set("Set-Cookie", result.setCookie);
    }
    return response;
  } catch (error) {
    console.error("[POST /api/session]", error);
    return err("Internal server error");
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const result = await ZeroTrustSessionService.terminateSession(req);
    if (!result.ok) {
      return err(result.error, result.status);
    }
    const response = ok<TerminateSessionResponse>(result.data);
    if (result.setCookie) {
      response.headers.set("Set-Cookie", result.setCookie);
    }
    return response;
  } catch (error) {
    console.error("[DELETE /api/session]", error);
    return err("Internal server error");
  }
}
