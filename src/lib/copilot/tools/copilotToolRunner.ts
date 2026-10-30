import { copilotToolTexts } from "../../../texts/copilotToolTexts";
import type { CopilotAction } from "../copilotTypes";
import { prepareProposal } from "./copilotConfirmTools";
import { runOpenTool } from "./copilotOpenTools";
import { runReadTool } from "./copilotReadTools";
import type { ConfirmToolName, CopilotProposal, CopilotToolCall, OpenToolName, ReadToolName, ToolContext } from "./copilotToolTypes";

export interface ToolRunOutcome {
  /** Ein Ergebnis je Aufruf, für die nächste Runde an Enes. */
  results: { id: string; content: string }[];
  /** Zuletzt geöffnete Seite. */
  navigate: CopilotAction | null;
  proposals: CopilotProposal[];
  /** true, wenn Enes Zahlen bekommen hat und darauf antworten soll. */
  needsAnswer: boolean;
}

let counter = 0;
const proposalId = () => `p${Date.now().toString(36)}${(counter += 1)}`;
const note = (text: string) => JSON.stringify({ status: text });

/**
 * Führt die Werkzeug-Aufrufe einer Runde aus: Lesen parallel, Öffnen sofort, Speichern als Vorschlag.
 * Adressen und Namen aus Vorschlägen bleiben auf dem Gerät; Enes erfährt nur, was vorbereitet wurde.
 */
export async function runToolCalls(calls: readonly CopilotToolCall[], ctx: ToolContext): Promise<ToolRunOutcome> {
  const t = copilotToolTexts;
  let navigate: CopilotAction | null = null;
  const proposals: CopilotProposal[] = [];
  const results = await Promise.all(
    calls.map(async (call) => {
      if (call.kind === "read") return { id: call.id, content: await runReadTool(call.name as ReadToolName, call.args, ctx) };
      if (call.kind === "open") {
        const action = runOpenTool(call.name as OpenToolName, call.args, ctx);
        if (action) navigate = action;
        return { id: call.id, content: note(action ? `${action.label} ${t.opened}` : t.notAllowed) };
      }
      const prepared = await prepareProposal(call.name as ConfirmToolName, call.args, ctx);
      if ("error" in prepared) return { id: call.id, content: note(prepared.error) };
      proposals.push({ ...prepared.proposal, id: proposalId(), state: "pending" });
      return { id: call.id, content: note(`${prepared.proposal.title}: ${t.awaitingConfirm}`) };
    }),
  );
  return { results, navigate, proposals, needsAnswer: calls.some((call) => call.kind === "read") };
}
