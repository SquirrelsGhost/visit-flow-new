import { Check, Loader2, X } from "lucide-react";
import { cn } from "../../lib/cn";
import type { CopilotProposal } from "../../lib/copilot/tools/copilotToolTypes";
import { copilotToolTexts } from "../../texts/copilotToolTexts";

interface CopilotProposalCardProps {
  proposal: CopilotProposal;
  onDecide: (proposal: CopilotProposal, yes: boolean) => void;
}

const CARD = "mt-2.5 rounded-2xl bg-white/70 p-3 ring-1 ring-inset ring-[var(--glass-divider)] dark:bg-white/[0.05]";
const YES =
  "no-touch-target-fix glass-keep-white inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-red-500 to-red-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_6px_14px_-8px_rgba(220,38,38,0.8)]";
const NO = "no-touch-target-fix inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-slate-500 hover:bg-slate-500/10 dark:text-white/60";
const NOTE: Record<CopilotProposal["state"], string> = {
  pending: "",
  running: "text-slate-500 dark:text-white/60",
  done: "text-emerald-600 dark:text-emerald-300",
  failed: "text-red-600 dark:text-rose-300",
  cancelled: "text-slate-400 dark:text-white/40",
};

/** Etwas, das Enes speichern möchte; passiert erst nach "Ja, mach". */
export default function CopilotProposalCard({ proposal, onDecide }: CopilotProposalCardProps) {
  const t = copilotToolTexts;
  return (
    <div className={CARD}>
      <p className="text-[13px] font-semibold text-slate-800 dark:text-white/90">{proposal.title}</p>
      <p className="text-[12.5px] text-slate-500 dark:text-white/60">{proposal.detail}</p>
      {proposal.state === "pending" ? (
        <div className="mt-2.5 flex gap-1.5">
          <button type="button" className={YES} onClick={() => onDecide(proposal, true)}>
            <Check className="h-3.5 w-3.5" />
            {t.confirm}
          </button>
          <button type="button" className={NO} onClick={() => onDecide(proposal, false)}>
            <X className="h-3.5 w-3.5" />
            {t.cancel}
          </button>
        </div>
      ) : (
        <p className={cn("mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium", NOTE[proposal.state])}>
          {proposal.state === "running" && <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" />}
          {proposal.state === "done" && <Check className="h-3.5 w-3.5" />}
          {proposal.note}
        </p>
      )}
    </div>
  );
}
