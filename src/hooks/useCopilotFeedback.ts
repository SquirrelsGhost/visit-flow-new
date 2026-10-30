import { useCallback, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { sendCopilotFeedback } from "../lib/copilot/copilotStream";
import type { CopilotFeedback, CopilotMessage } from "../lib/copilot/copilotTypes";
import { copilotTexts } from "../texts/copilotTexts";

/** 👍/👎 zu einer Server-Antwort (v1 Stufe 3): sofort anzeigen, bei Fehler zurücknehmen. */
export function useCopilotFeedback(setMessages: Dispatch<SetStateAction<CopilotMessage[]>>) {
  const rate = useCallback(
    async (message: CopilotMessage, feedback: CopilotFeedback) => {
      if (!message.logId || message.feedback) return;
      const set = (value: CopilotFeedback | null) => setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, feedback: value } : m)));
      set(feedback);
      const saved = await sendCopilotFeedback(message.logId, feedback);
      if (saved) return;
      set(null);
      toast.error(copilotTexts.feedbackFailed);
    },
    [setMessages],
  );
  return { rate };
}
