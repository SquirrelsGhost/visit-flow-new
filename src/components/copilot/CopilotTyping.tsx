import { motion } from "motion/react";

const DOTS = [0, 0.15, 0.3] as const;

/** Drei Punkte, die nacheinander hüpfen, solange Enes nachdenkt (v1: leuchtende Balken). */
export interface CopilotTypingProps { readonly _?: never; }

export default function CopilotTyping() {
  return (
    <span className="flex h-5 items-center gap-1 px-0.5" aria-label="Enes schreibt">
      {DOTS.map((delay) => (
        <motion.span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-gradient-to-b from-rose-400 to-red-600"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut", delay }}
        />
      ))}
    </span>
  );
}
