import { randomUUID } from "node:crypto";
import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TariffAndCopilotDatabaseService } from "@/services/TariffAndCopilotDatabaseService";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { slug = [] } = await context.params;
    if (slug[0] === "memory") {
      const memories = await TariffAndCopilotDatabaseService.listMemories(user.id);
      return ok(memories);
    }
    return ok([]);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/copilot/[[...slug]]]", error);
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
    const body = (await req.json().catch(() => ({}))) as { message?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (path === "feedback") {
      return ok({ saved: true });
    }

    const logId = `cop-${randomUUID().slice(0, 8)}`;
    const reply = message
      ? `Hier ist dein Coach-Impuls zu „${message.slice(0, 80)}“: Fokus auf Bedarfsermittlung an der Tür, nutze den Tarif-Vergleich im Simulator und sichere dir verbindliche Folgetermine.`
      : "Wie kann ich dir heute im Außendienst helfen?";

    if (path === "chat-stream" || (path === "chat" && (req.headers.get("accept") ?? "").includes("text/event-stream"))) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", text: reply })}\n\n`));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", logId, final: true })}\n\n`),
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    return ok({ reply, logId, final: true });
  } catch (error) {
    console.error("[POST /api/copilot/[[...slug]]]", error);
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
    const userId = user.id;
    if (slug[0] === "memory" && slug[1]) {
      await TariffAndCopilotDatabaseService.deleteMemory(userId, slug[1]);
      return ok({ deleted: true });
    }
    if (slug[0] === "memory") {
      const res = await TariffAndCopilotDatabaseService.clearMemories(userId);
      return ok(res);
    }
    return ok({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/copilot/[[...slug]]]", error);
    return err("Internal server error");
  }
}
