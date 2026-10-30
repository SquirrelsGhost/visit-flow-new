import { ArrowUpRight } from "lucide-react";
import type { CopilotAction } from "../../lib/copilot/copilotTypes";

interface CopilotActionsProps {
  actions: readonly CopilotAction[];
  onOpen: (action: CopilotAction) => void;
}

const ACTION =
  "no-touch-target-fix inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-[12.5px] font-semibold text-red-600 ring-1 ring-inset ring-red-500/20 transition-colors duration-200 hover:bg-red-500/15 dark:text-rose-300";

/** Knöpfe unter einer Antwort, die direkt zur passenden Seite führen. */
export default function CopilotActions({ actions, onOpen }: CopilotActionsProps) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {actions.map((action) => (
        <button key={action.href} type="button" className={ACTION} onClick={() => onOpen(action)}>
          {action.label}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
