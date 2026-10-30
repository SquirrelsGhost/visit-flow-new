import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { CopilotFeedback as Rating } from "../../lib/copilot/copilotTypes";
import { cn } from "../../lib/cn";
import { copilotTexts } from "../../texts/copilotTexts";

interface CopilotFeedbackProps {
  value: Rating | null | undefined;
  onRate: (rating: Rating) => void;
}

const THUMB = "no-touch-target-fix grid h-7 w-7 place-items-center rounded-full transition-colors duration-200 disabled:cursor-default";

/** 👍/👎 unter einer Server-Antwort; 👍 speichert v1 als Lern-Beispiel für Enes. */
export default function CopilotFeedback({ value, onRate }: CopilotFeedbackProps) {
  const done = Boolean(value);
  return (
    <div className="mt-2 flex items-center gap-1 border-t border-[var(--glass-divider)] pt-2 text-[11px] text-muted-foreground">
      <span className="mr-1">{value === "up" ? copilotTexts.savedUp : value === "down" ? copilotTexts.savedDown : copilotTexts.helpful}</span>
      <button
        type="button"
        aria-label={copilotTexts.thumbUp}
        disabled={done}
        onClick={() => onRate("up")}
        className={cn(THUMB, value === "up" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "hover:bg-emerald-500/10 hover:text-emerald-600", done && value !== "up" && "opacity-40")}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label={copilotTexts.thumbDown}
        disabled={done}
        onClick={() => onRate("down")}
        className={cn(THUMB, value === "down" ? "bg-red-500/15 text-red-600 dark:text-red-400" : "hover:bg-red-500/10 hover:text-red-600", done && value !== "down" && "opacity-40")}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
