import { COPILOT_TOOLS, type CopilotToolKind, type CopilotToolName } from "@visit-flow/shared/copilotTools";
import type { LlmTool, LlmToolCall } from "./llm/LlmClient";

/** Ein Werkzeug-Aufruf, wie die App ihn bekommt: geprüfter Name, Art und gelesene Argumente. */
export interface CopilotToolCallView {
  id: string;
  name: CopilotToolName;
  kind: CopilotToolKind;
  args: Record<string, unknown>;
  /** Originaltext der Argumente; die App schickt ihn in der nächsten Runde unverändert zurück. */
  arguments: string;
}

const isToolName = (name: string): name is CopilotToolName => Object.hasOwn(COPILOT_TOOLS, name);

/** Beschreibungen der Werkzeuge, die die App für diesen Nutzer anbietet. */
export function llmToolsFor(names: readonly CopilotToolName[]): LlmTool[] {
  return names.map((name) => ({ type: "function", function: { name, description: COPILOT_TOOLS[name].description, parameters: COPILOT_TOOLS[name].parameters } }));
}

function parseArgs(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Lässt nur Aufrufe durch, die die App angeboten hat und deren Argumente gültiges JSON sind.
 * Prüfen, ob die Werte passen, muss die App sowieso (sie führt aus); hier geht es um Müll vom Modell.
 */
export function acceptToolCalls(calls: readonly LlmToolCall[], offered: readonly CopilotToolName[], max = 4): CopilotToolCallView[] {
  const out: CopilotToolCallView[] = [];
  for (const call of calls) {
    if (!isToolName(call.name) || !offered.includes(call.name) || out.length >= max) continue;
    const args = parseArgs(call.arguments);
    if (args) out.push({ id: call.id.slice(0, 64), name: call.name, kind: COPILOT_TOOLS[call.name].kind, args, arguments: call.arguments.slice(0, 2000) });
  }
  return out;
}
