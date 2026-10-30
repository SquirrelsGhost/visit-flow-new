import { useCallback, type Dispatch, type SetStateAction } from "react";
import { runProposal } from "../lib/copilot/tools/copilotConfirmTools";
import type { CopilotProposal, ProposalState } from "../lib/copilot/tools/copilotToolTypes";
import type { CopilotMessage } from "../lib/copilot/copilotTypes";
import { copilotToolTexts } from "../texts/copilotToolTexts";
import { useAuth } from "./useAuth";
import { useVertical } from "./useVertical";

/** "Ja, mach" oder "Abbrechen" auf einer Bestätigungskarte von Enes. */
export function useCopilotProposals(setMessages: Dispatch<SetStateAction<CopilotMessage[]>>) {
  const { user } = useAuth();
  const vertical = useVertical();

  const setState = useCallback(
    (messageId: string, proposalId: string, state: ProposalState, note?: string) => {
      setMessages((list) =>
        list.map((m) => (m.id === messageId ? { ...m, proposals: m.proposals?.map((p) => (p.id === proposalId ? { ...p, state, note } : p)) } : m)),
      );
    },
    [setMessages],
  );

  const decide = useCallback(
    async (messageId: string, proposal: CopilotProposal, yes: boolean) => {
      if (proposal.state !== "pending") return;
      if (!yes) return setState(messageId, proposal.id, "cancelled", copilotToolTexts.cancelled);
      setState(messageId, proposal.id, "running", copilotToolTexts.saving);
      const result = await runProposal(proposal, { user, vertical, message: "", now: Date.now() });
      setState(messageId, proposal.id, result.ok ? "done" : "failed", result.note);
    },
    [setState, user, vertical],
  );

  return { decide };
}
