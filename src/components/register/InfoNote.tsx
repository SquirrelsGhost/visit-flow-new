import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface InfoNoteProps {
  Icon: LucideIcon;
  title: string;
  text: string;
  tone: "amber" | "blue";
}

const TONES = {
  amber: {
    box: "border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/20",
    icon: "text-amber-600",
    title: "text-amber-900 dark:text-amber-100",
    text: "text-amber-700 dark:text-amber-300",
  },
  blue: {
    box: "border-blue-200 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-950/20",
    icon: "text-blue-600",
    title: "text-blue-900 dark:text-blue-100",
    text: "text-blue-700 dark:text-blue-300",
  },
} as const;

/** Farbiger Hinweis aus v1 (Sicherheitsprüfung gelb, Code an Firmenmail blau). */
export default function InfoNote({ Icon, title, text, tone }: InfoNoteProps) {
  const style = TONES[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", style.box)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.icon)} strokeWidth={1.75} />
      <div>
        <h3 className={cn("mb-1 text-sm font-semibold", style.title)}>{title}</h3>
        <p className={cn("text-xs leading-relaxed", style.text)}>{text}</p>
      </div>
    </div>
  );
}
