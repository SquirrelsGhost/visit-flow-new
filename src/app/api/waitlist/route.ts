import { err, ok } from "@/lib/api";
import { parseWaitlistInput } from "@/lib/waitlist/waitlistRules";
import { WaitlistDatabaseService, type WaitlistJoinResult } from "@/services/WaitlistDatabaseService";

/** Öffentlich: Eintragen in die Warteliste der Website. Antwortet mit dem Platz. */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = parseWaitlistInput(body);
    if (!parsed.ok) return err(parsed.error, 400);
    if (!WaitlistDatabaseService.allow(req)) return err("rate", 429);
    // Honigtopf ausgefüllt: so tun, als ob es geklappt hätte, aber nichts speichern
    if (parsed.value.website) return ok<WaitlistJoinResult>({ position: 0, already: false }, 201);
    const result = await WaitlistDatabaseService.join(req, parsed.value);
    return ok<WaitlistJoinResult>(result, result.already ? 200 : 201);
  } catch (error) {
    console.error("[POST /api/waitlist]", error);
    return err("Internal server error");
  }
}

/** Öffentlich: nur die Anzahl der Einträge, keine Daten. */
export async function GET(): Promise<Response> {
  try {
    return ok<{ count: number }>({ count: await WaitlistDatabaseService.count() });
  } catch (error) {
    console.error("[GET /api/waitlist]", error);
    return err("Internal server error");
  }
}
