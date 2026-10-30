import { motion } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { cardIn } from "../../lib/motion/presets";

interface SpotlightCardProps {
  className?: string;
  children: ReactNode;
}

/**
 * Karte, die beim Laden sanft erscheint. Mit der Maus folgt ihr ein weicher roter Lichtschein,
 * auf dem Handy bleibt sie ruhig.
 */
export default function SpotlightCard({ className, children }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card || event.pointerType !== "mouse") return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <motion.div
      ref={ref}
      variants={cardIn}
      initial="hidden"
      animate="show"
      onPointerMove={onPointerMove}
      className={cn("glass-surface group/spot rounded-[22px] text-card-foreground", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100 [background:radial-gradient(520px_circle_at_var(--spot-x,50%)_var(--spot-y,0%),rgb(239_68_68/0.07),transparent_60%)]"
      />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}
