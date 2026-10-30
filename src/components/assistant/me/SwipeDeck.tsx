import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type PanInfo, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { hapticFeedback } from "../../../lib/device/haptics";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { meTexts as t } from "../../../texts/assistantTexts";

const slide: Variants = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
};

interface SwipeDeckProps {
  count: number;
  index: number;
  dir: number;
  onStep: (step: 1 | -1) => void;
  children: (index: number) => ReactNode;
  className?: string;
}

/**
 * Wischbarer Kartenstapel (v1 SwipeableGoalCard / SwipeableBonusCard): folgt dem Finger,
 * gleitet in Wischrichtung weiter, auf dem Desktop mit Pfeilen. Punkte zeigen die Position.
 */
export default function SwipeDeck({ count, index, dir, onStep, children, className }: SwipeDeckProps) {
  const many = count > 1;
  const step = (s: 1 | -1) => {
    const next = index + s;
    if (next < 0 || next >= count) return;
    hapticFeedback("light");
    onStep(s);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -300) step(1);
    else if (info.offset.x > 50 || info.velocity.x > 300) step(-1);
  };

  return (
    <div data-swipe-zone className={cn("group relative overflow-hidden", className)} style={{ touchAction: "pan-y" }}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={index}
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SOFT_SPRING}
          drag={many ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          {children(index)}
        </motion.div>
      </AnimatePresence>
      {many && (
        <>
          <div className="flex items-center justify-center gap-1.5 pb-3" aria-hidden>
            {Array.from({ length: count }, (_, i) => (
              <motion.span
                key={i}
                className={cn("h-1.5 rounded-full", i === index ? "bg-slate-700 dark:bg-slate-200" : "bg-slate-300 dark:bg-slate-600")}
                animate={{ width: i === index ? 16 : 6 }}
                transition={SOFT_SPRING}
              />
            ))}
          </div>
          <DeckArrow side="left" disabled={index === 0} onClick={() => step(-1)} />
          <DeckArrow side="right" disabled={index === count - 1} onClick={() => step(1)} />
        </>
      )}
    </div>
  );
}

function DeckArrow({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? t.prevView : t.nextView}
      className={cn(
        "absolute top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow-sm ring-1 ring-slate-200 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 disabled:!opacity-0 md:flex dark:bg-slate-800/90 dark:text-slate-300 dark:ring-slate-700",
        side === "left" ? "left-1.5" : "right-1.5",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
