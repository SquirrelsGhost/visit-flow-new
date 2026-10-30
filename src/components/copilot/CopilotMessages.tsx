import { useEffect, useRef, type ReactNode } from "react";
import type { CopilotAction, CopilotFeedback, CopilotMessage } from "../../lib/copilot/copilotTypes";
import type { CopilotProposal } from "../../lib/copilot/tools/copilotToolTypes";
import CopilotBubble from "./CopilotBubble";

interface CopilotMessagesProps {
  messages: readonly CopilotMessage[];
  onRate: (message: CopilotMessage, rating: CopilotFeedback) => void;
  onOpen: (action: CopilotAction) => void;
  onDecide: (message: CopilotMessage, proposal: CopilotProposal, yes: boolean) => void;
  /** Unter dem Verlauf, z. B. Vorschläge im frischen Gespräch. */
  children?: ReactNode;
}

/** Scrollender Verlauf; folgt jeder neuen Nachricht und jedem gestreamten Wort nach unten. */
export default function CopilotMessages({ messages, onRate, onOpen, onDecide, children }: CopilotMessagesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, last?.text, last?.proposals?.length]);

  return (
    <div ref={ref} className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
      {messages.map((message) => (
        <CopilotBubble key={message.id} message={message} onRate={onRate} onOpen={onOpen} onDecide={onDecide} />
      ))}
      {children}
    </div>
  );
}
