import { kindOf } from "./copilotToolAccess";
import { CONFIRM_TOOLS, OPEN_TOOLS, READ_TOOLS, type CopilotToolCall, type CopilotToolName } from "./copilotToolTypes";

const NAMES: readonly string[] = [...READ_TOOLS, ...OPEN_TOOLS, ...CONFIRM_TOOLS];
const isName = (value: unknown): value is CopilotToolName => typeof value === "string" && NAMES.includes(value);

/**
 * Werkzeug-Aufrufe aus dem Server-Event lesen. Die Art (lesen, öffnen, speichern) bestimmt die App
 * selbst; was sie nicht kennt, fällt weg.
 */
export function readToolCalls(raw: unknown): CopilotToolCall[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): CopilotToolCall[] => {
    if (!item || typeof item !== "object") return [];
    const call = item as Record<string, unknown>;
    if (typeof call.id !== "string" || !isName(call.name)) return [];
    const args = call.args && typeof call.args === "object" && !Array.isArray(call.args) ? (call.args as Record<string, unknown>) : {};
    const text = typeof call.arguments === "string" ? call.arguments : JSON.stringify(args);
    return [{ id: call.id, name: call.name, kind: kindOf(call.name), args, arguments: text }];
  });
}
