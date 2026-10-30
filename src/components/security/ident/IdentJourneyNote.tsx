import { ArrowDown, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface IdentJourneyNoteProps {
  icon: LucideIcon;
  /** Kleine Zeile darüber, z. B. "Danach" oder "Unterzeichnet". */
  label: string;
  title: string;
  state: "done" | "next";
}

/** Verbindet Vertrag und Online-Ident in der Schrittliste: zeigt den erledigten Teil davor oder den Teil danach. */
export default function IdentJourneyNote({ icon: Icon, label, title, state }: IdentJourneyNoteProps) {
  const done = state === "done";
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl px-3.5 py-3 ring-1 ring-inset", done ? "bg-emerald-400/[0.08] ring-emerald-400/25" : "bg-white/[0.04] ring-white/10")}>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", done ? "bg-emerald-500 text-white" : "bg-white/[0.08] text-white/60")}>
        {done ? <Check className="h-4 w-4" strokeWidth={2.6} /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[10.5px] font-semibold uppercase tracking-[0.16em]", done ? "text-emerald-300" : "text-white/45")}>{label}</span>
        <span className="block truncate text-[13px] font-medium text-white/85">{title}</span>
      </span>
      {!done && <ArrowDown aria-hidden className="h-4 w-4 shrink-0 text-white/35" />}
    </div>
  );
}
