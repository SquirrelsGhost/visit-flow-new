import { askCopilot } from "./copilotStream";
import type { CopilotAction, CopilotDone, CopilotPayload } from "./copilotTypes";
import { runToolCalls } from "./tools/copilotToolRunner";
import type { CopilotProposal, CopilotToolRound, ToolContext } from "./tools/copilotToolTypes";

/** Wie die API: nach drei Werkzeug-Runden muss Enes antworten. */
const MAX_TOOL_ROUNDS = 3;

export interface ConversationHandlers {
  /** Gesamter bisher sichtbarer Text der Antwort. */
  onText: (text: string) => void;
  onNavigate: (action: CopilotAction) => void;
  onProposals: (proposals: CopilotProposal[]) => void;
}

const join = (a: string, b: string) => (a && b ? `${a} ${b}` : a || b);

/**
 * Eine Frage an Enes samt Werkzeug-Runden: Antwort streamen, Werkzeuge in der App ausführen,
 * Ergebnisse der Lese-Werkzeuge zurückschicken, bis Enes fertig ist.
 */
export async function askWithTools(payload: CopilotPayload, ctx: ToolContext, handlers: ConversationHandlers, signal: AbortSignal): Promise<{ text: string; done: CopilotDone | null }> {
  let rounds: CopilotToolRound[] = [];
  let shown = "";
  for (;;) {
    let roundText = "";
    const done = await askCopilot({ ...payload, toolRounds: rounds }, (token) => handlers.onText(join(shown, (roundText += token))), signal);
    shown = join(shown, roundText.trim());
    const calls = done?.toolCalls ?? [];
    if (!done || calls.length === 0) return { text: shown, done };
    const outcome = await runToolCalls(calls, ctx);
    if (signal.aborted) return { text: shown, done };
    if (outcome.navigate) handlers.onNavigate(outcome.navigate);
    if (outcome.proposals.length > 0) handlers.onProposals(outcome.proposals);
    if (done.final !== false || !outcome.needsAnswer || rounds.length + 1 > MAX_TOOL_ROUNDS) return { text: shown, done };
    rounds = [...rounds, { text: roundText.trim(), calls: calls.map(({ id, name, arguments: text }) => ({ id, name, arguments: text })), results: outcome.results }];
  }
}
