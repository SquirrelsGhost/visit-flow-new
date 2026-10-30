import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

interface SheetNoteProps {
  icon: LucideIcon;
  tone?: "info" | "warn";
  children: ReactNode;
}

/** Kurzer Hinweis im Sheet (Kosten, Wirkung), farbig nach Gewicht. */
export default function SheetNote({ icon: Icon, tone = "info", children }: SheetNoteProps) {
  return (
    <div className={cn("flex gap-2.5 rounded-2xl px-3.5 py-3 text-[13px] leading-snug", tone === "warn" ? "bg-amber-500/10 text-amber-800 dark:text-amber-200" : "bg-slate-900/[0.04] text-muted-foreground dark:bg-white/[0.05]")}>
      <Icon aria-hidden className="mt-px h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
