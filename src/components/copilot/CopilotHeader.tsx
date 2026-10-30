import { RotateCcw, X } from "lucide-react";
import type { CopilotMode } from "../../hooks/useCopilotChat";
import { cn } from "../../lib/cn";
import { copilotTexts } from "../../texts/copilotTexts";
import { GLASS_ICON_BUTTON } from "../glass/glassStyles";
import CopilotOrb from "./CopilotOrb";

interface CopilotHeaderProps {
  labelId: string;
  mode: CopilotMode;
  onRestart: () => void;
  onClose: () => void;
}

const DOT: Record<CopilotMode, string> = {
  live: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  local: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]",
  demo: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]",
};

/** Kopf des Chats: Enes mit Status (Live, Offline-Wissen, Demo), neues Gespräch und Schließen. */
export default function CopilotHeader({ labelId, mode, onRestart, onClose }: CopilotHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-[var(--glass-divider)] px-4 pb-3 pt-3">
      <CopilotOrb size={42} />
      <div className="min-w-0 flex-1">
        <h2 id={labelId} className="text-[16px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
          {copilotTexts.name} <span className="font-normal text-muted-foreground">· {copilotTexts.role}</span>
        </h2>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]">
          <span className={cn("h-1.5 w-1.5 rounded-full motion-safe:animate-pulse", DOT[mode])} />
          {copilotTexts.status[mode]}
        </p>
      </div>
      <button type="button" className={GLASS_ICON_BUTTON} aria-label={copilotTexts.restart} title={copilotTexts.restart} onClick={onRestart}>
        <RotateCcw className="h-4 w-4" />
      </button>
      <button type="button" className={GLASS_ICON_BUTTON} aria-label={copilotTexts.close} onClick={onClose}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
