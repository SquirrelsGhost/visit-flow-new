import { Check, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

interface IdentRailStepProps {
  icon: LucideIcon;
  title: string;
  text: string;
  state: "done" | "active" | "todo";
  isLast: boolean;
  onSelect: () => void;
}

const DOT = "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow,color] duration-500";
const DOT_STATE = {
  done: "bg-gradient-to-br from-emerald-300 to-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.7)]",
  active: "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_22px_-6px_rgba(220,38,38,0.8)]",
  todo: "bg-white/[0.07] text-white/45 ring-1 ring-inset ring-white/10",
} as const;

/** Eine Station der Schrittliste: Plakette, Verbindungslinie nach unten, Titel und Kurztext. */
export default function IdentRailStep({ icon: Icon, title, text, state, isLast, onSelect }: IdentRailStepProps) {
  return (
    <li className="relative flex gap-3.5 pb-6 last:pb-0">
      {!isLast && (
        <span aria-hidden className="absolute left-5 top-10 bottom-0 w-px -translate-x-1/2 bg-white/10">
          <motion.span
            className="block h-full w-full origin-top bg-gradient-to-b from-emerald-400 to-emerald-500/40"
            initial={false}
            animate={{ scaleY: state === "done" ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </span>
      )}
      <button
        type="button"
        disabled={state !== "done"}
        onClick={onSelect}
        aria-current={state === "active" ? "step" : undefined}
        className="group flex min-w-0 items-start gap-3.5 text-left disabled:cursor-default"
      >
        <span className={cn(DOT, DOT_STATE[state])}>
          {state === "done" ? <Check className="h-[18px] w-[18px]" strokeWidth={2.6} /> : <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />}
          {state === "active" && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-red-500/30 [animation-duration:2.4s] motion-reduce:hidden" />}
        </span>
        <span className="min-w-0 pt-0.5">
          <span className={cn("block text-[14px] font-semibold leading-tight", state === "todo" ? "text-white/50" : "text-white", state === "done" && "group-hover:underline")}>{title}</span>
          {state === "active" && <span className="mt-1 block text-[12px] leading-snug text-white/65">{text}</span>}
        </span>
      </button>
    </li>
  );
}
