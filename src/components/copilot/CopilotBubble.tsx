import { motion } from "motion/react";
import type { CopilotAction, CopilotFeedback as Rating, CopilotMessage } from "../../lib/copilot/copilotTypes";
import type { CopilotProposal } from "../../lib/copilot/tools/copilotToolTypes";
import { cn } from "../../lib/cn";
import CopilotActions from "./CopilotActions";
import CopilotFeedback from "./CopilotFeedback";
import CopilotOrb from "./CopilotOrb";
import CopilotProposalCard from "./CopilotProposalCard";
import CopilotRichText from "./CopilotRichText";
import CopilotTyping from "./CopilotTyping";

interface CopilotBubbleProps {
  message: CopilotMessage;
  onRate: (message: CopilotMessage, rating: Rating) => void;
  onOpen: (action: CopilotAction) => void;
  onDecide: (message: CopilotMessage, proposal: CopilotProposal, yes: boolean) => void;
}

const BASE = "max-w-[84%] px-4 py-2.5 text-[14px] leading-relaxed";
/** Eigene Nachricht im roten Verlauf der App, Enes auf hellem Glas. */
const USER =
  "glass-keep-white rounded-[20px] rounded-br-[6px] bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_22px_-12px_rgba(220,38,38,0.7)]";
const AI = "rounded-[20px] rounded-bl-[6px] bg-white/80 text-slate-700 ring-1 ring-inset ring-[var(--glass-divider)] shadow-[0_8px_20px_-14px_rgba(15,23,42,0.3)] dark:bg-white/[0.06] dark:text-white/85";

/** Eine Nachricht im Verlauf; Antworten von Enes mit Symbol, Knöpfen und Feedback. */
export default function CopilotBubble({ message, onRate, onOpen, onDecide }: CopilotBubbleProps) {
  const mine = message.sender === "user";
  const waiting = message.pending && !message.text;
  return (
    <motion.div
      className={cn("flex w-full items-end gap-2", mine ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      {!mine && <CopilotOrb size={24} still className="mb-1" />}
      <div className={cn(BASE, mine ? USER : AI)}>
        {waiting ? <CopilotTyping /> : <CopilotRichText text={message.text} />}
        {message.pending && message.text && <span aria-hidden className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-red-500 motion-safe:animate-pulse" />}
        {!message.pending && message.actions && message.actions.length > 0 && <CopilotActions actions={message.actions} onOpen={onOpen} />}
        {message.proposals?.map((proposal) => (
          <CopilotProposalCard key={proposal.id} proposal={proposal} onDecide={(p, yes) => onDecide(message, p, yes)} />
        ))}
        {!message.pending && message.logId && <CopilotFeedback value={message.feedback} onRate={(rating) => onRate(message, rating)} />}
      </div>
    </motion.div>
  );
}
