import { ArrowLeft, ArrowRight, ArrowUp, CircleAlert, Loader2, Mic, ScanFace } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { cn } from "@/lib/cn";

interface LiveVideoPromptProps {
  /** -1 = Ausrichten, 0..3 = Bewegung. */
  moveIdx: number;
  text: string;
  mode: "loading" | "hint" | "normal";
  /** Mikrofonpegel 0..1 beim Vorlesen. */
  audio: number;
}

const MOVE_ICONS = [ArrowLeft, ArrowRight, ArrowUp, Mic] as const;
const NUDGE: readonly TargetAndTransition[] = [{ x: [0, -6, 0] }, { x: [0, 6, 0] }, { y: [0, -6, 0] }, { scale: [1, 1.15, 1] }];
const BARS = [0.5, 0.8, 1, 0.8, 0.5] as const;

/** Anweisung unten im Kamerabild: Symbol in Blickrichtung, Text, beim Vorlesen ein Pegel. */
export default function LiveVideoPrompt({ moveIdx, text, mode, audio }: LiveVideoPromptProps) {
  const reduce = useReducedMotion();
  const Icon = mode === "loading" ? Loader2 : mode === "hint" ? CircleAlert : moveIdx < 0 ? ScanFace : MOVE_ICONS[moveIdx];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-black/55 px-3.5 py-2.5 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md">
        <motion.span
          animate={reduce || mode !== "normal" || moveIdx < 0 ? undefined : NUDGE[moveIdx]}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", mode === "hint" ? "bg-amber-500" : "bg-gradient-to-b from-red-500 to-red-600")}
        >
          <Icon className={cn("h-4 w-4", mode === "loading" && "animate-spin motion-reduce:animate-none")} />
        </motion.span>
        <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">{text}</span>
        {moveIdx === 3 && mode === "normal" && (
          <span aria-hidden className="flex h-6 shrink-0 items-end gap-0.5">
            {BARS.map((weight, i) => (
              <span key={i} className="w-1 rounded-full bg-emerald-400 transition-[height] duration-100" style={{ height: `${Math.max(15, Math.min(100, audio * 160 * weight))}%` }} />
            ))}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
