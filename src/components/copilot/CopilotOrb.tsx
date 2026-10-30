import { Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";

interface CopilotOrbProps {
  /** Pixelgröße des Kreises. */
  size: number;
  /** Ruhiger ohne Lauflicht, z. B. als kleines Symbol im Chat. */
  still?: boolean;
  className?: string;
}

/** Ring aus rotem Lauflicht in der Markenfarbe um einen gläsernen Kern: das Gesicht von Enes. */
const RING = "conic-gradient(from 0deg, #ef4444, #fb7185, #f59e0b, #ef4444)";

export default function CopilotOrb({ size, still = false, className }: CopilotOrbProps) {
  return (
    <span
      aria-hidden
      className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <span
        className={cn("absolute inset-0", !still && "motion-safe:animate-[spin_5s_linear_infinite]")}
        style={{ background: RING }}
      />
      <span className="absolute inset-[2px] rounded-full bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-[rgba(14,16,25,0.92)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
      <span className="absolute inset-[22%] rounded-full bg-gradient-to-br from-rose-400 to-red-600 opacity-20 blur-md" />
      <Sparkles className="relative text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.45)] dark:text-rose-300" style={{ width: size * 0.42, height: size * 0.42 }} strokeWidth={2.1} />
    </span>
  );
}
