import { refreshAccessToken } from "../apiClient";
import { getAccessToken } from "../auth/accessToken";
import { json, legacyRequest } from "../battle/legacyRequest";
import type { CopilotDone, CopilotPayload } from "./copilotTypes";
import { readToolCalls } from "./tools/copilotToolCalls";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Server nicht erreichbar oder ohne KI: der Aufrufer antwortet dann aus dem lokalen Wissen. */
export class CopilotOffline extends Error {}

interface StreamEvent {
  type?: string;
  text?: string;
  message?: string;
  logId?: string | null;
  intent?: string;
  action?: string;
  path?: string | null;
  final?: boolean;
  calls?: unknown;
}

function openStream(payload: CopilotPayload, signal: AbortSignal): Promise<Response> {
  const token = getAccessToken();
  return fetch(`${API_URL}/api/copilot/chat-stream`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

const doneOf = (e: StreamEvent): CopilotDone => ({
  logId: e.logId ?? undefined,
  intent: e.intent,
  action: e.action,
  path: e.path ?? undefined,
  final: e.final !== false,
});

/** Liest die SSE-Zeilen ("data: {...}") und meldet jedes Token sofort. */
async function readEvents(body: ReadableStream<Uint8Array>, onToken: (text: string) => void): Promise<CopilotDone | null> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done: CopilotDone | null = null;
  let toolCalls: CopilotDone["toolCalls"] = [];
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      let event: StreamEvent;
      try {
        event = JSON.parse(line.slice(6)) as StreamEvent;
      } catch {
        continue;
      }
      if (event.type === "token" && event.text) onToken(event.text);
      else if (event.type === "tool_calls") toolCalls = readToolCalls(event.calls);
      else if (event.type === "done") done = doneOf(event);
      else if (event.type === "error") throw new Error(event.message || "Stream-Fehler");
    }
  }
  return done ? { ...done, toolCalls } : null;
}

/** Ersatzweg aus v1: dieselbe Frage an /copilot/chat, Antwort am Stück. */
async function askOnce(payload: CopilotPayload, onToken: (text: string) => void): Promise<CopilotDone> {
  const raw = await legacyRequest("/copilot/chat", json("POST", payload));
  // v1 antwortet flach, v2 mit { success, data: { reply, ... } }
  const body: Record<string, unknown> = raw.data && typeof raw.data === "object" ? (raw.data as Record<string, unknown>) : raw;
  const reply = typeof body.reply === "string" ? body.reply : null;
  if (!reply) throw new CopilotOffline(raw.message || raw.error || "Keine Antwort");
  onToken(reply);
  const path = typeof body.target === "string" ? body.target : typeof body.path === "string" ? body.path : undefined;
  return {
    logId: typeof body.logId === "string" ? body.logId : undefined,
    intent: typeof body.intent === "string" ? body.intent : undefined,
    action: typeof body.action === "string" ? body.action : undefined,
    path,
    final: body.final !== false,
    toolCalls: readToolCalls(body.toolCalls),
  };
}

/**
 * Fragt Enes wie v1: zuerst gestreamt (/copilot/chat-stream), sonst /copilot/chat. Ein abgelaufenes
 * Access-Token wird einmal still erneuert. Scheitert beides, kommt CopilotOffline.
 */
export async function askCopilot(payload: CopilotPayload, onToken: (text: string) => void, signal: AbortSignal): Promise<CopilotDone | null> {
  let response: Response;
  try {
    response = await openStream(payload, signal);
    if (response.status === 401 && (await refreshAccessToken())) response = await openStream(payload, signal);
  } catch (error) {
    if (signal.aborted) throw error;
    throw new CopilotOffline("Netzwerk");
  }
  if (response.ok && response.body) return readEvents(response.body, onToken);
  try {
    return await askOnce(payload, onToken);
  } catch {
    throw new CopilotOffline("Server");
  }
}

/** 👍/👎 zu einer Server-Antwort (v1 POST /copilot/feedback). */
export async function sendCopilotFeedback(logId: string, feedback: "up" | "down", reason?: string): Promise<boolean> {
  const body = await legacyRequest("/copilot/feedback", json("POST", { logId, feedback, reason }));
  return body.success !== false && !body.error;
}
