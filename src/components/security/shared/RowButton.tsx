import type { LucideIcon } from "lucide-react";
import { cn } from "../../../lib/cn";
import { ROW_BUTTON, ROW_BUTTON_TONE } from "../securityStyles";

interface RowButtonProps {
  label: string;
  onClick: () => void;
  tone?: keyof typeof ROW_BUTTON_TONE;
  icon?: LucideIcon;
  /** Name für Screenreader, wenn das Wort allein nicht reicht (z. B. "Entsperren 1.2.3.4"). */
  ariaLabel?: string;
}

/** Kleiner Pillenknopf rechts in einer Zeile. */
export default function RowButton({ label, onClick, tone = "green", icon: Icon, ariaLabel }: RowButtonProps) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cn(ROW_BUTTON, ROW_BUTTON_TONE[tone])}>
      {Icon && <Icon aria-hidden className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
