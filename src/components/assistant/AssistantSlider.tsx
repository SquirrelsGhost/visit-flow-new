// Wischen, Höhe messen und Federn brauchen den Browser
"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useCoarsePointer } from "../../hooks/useCoarsePointer";
import { hapticFeedback } from "../../lib/device/haptics";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { usePanelHeight } from "../../hooks/usePanelHeight";

/** Ab einem Viertel der Breite oder einem schnellen Wisch wechselt der Reiter (v1). */
const SNAP_SHARE = 0.25;
const SNAP_VELOCITY = 300;
/** Am ersten und letzten Reiter gibt die Fläche nur federnd nach. */
const EDGE_RESISTANCE = 0.15;

interface AssistantSliderProps {
  index: number;
  onIndexChange: (index: number) => void;
  panels: readonly ReactNode[];
}

/**
 * Die drei Reiter nebeneinander. Auf dem Handy folgen sie dem Finger und rasten weich ein,
 * die Höhe gleitet zur Höhe des aktiven Reiters (v1 PatternAnalysisDemoPage, hier mit Federn statt CSS-Übergang).
 */
export default function AssistantSlider({ index, onIndexChange, panels }: AssistantSliderProps) {
  const count = panels.length;
  const swipe = useCoarsePointer();
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const height = usePanelHeight(panelRefs, index);
  const base = useMotionValue((-index * 100) / count);
  const drag = useMotionValue(0);
  const transform = useMotionTemplate`translate3d(calc(${base}% + ${drag}px), 0, 0)`;
  const locked = useRef<"x" | "y" | null>(null);

  useEffect(() => {
    const transition = reduced ? { duration: 0 } : SOFT_SPRING;
    const a = animate(base, (-index * 100) / count, transition);
    const b = animate(drag, 0, transition);
    return () => {
      a.stop();
      b.stop();
    };
  }, [index, count, base, drag, reduced]);

  const onPan = (event: PointerEvent, info: PanInfo) => {
    // Karten mit eigenem Wischen (Ziele, Bonus) behalten die Geste für sich
    const own = event.target instanceof Element && event.target.closest("[data-swipe-zone]");
    locked.current ??= !own && Math.abs(info.offset.x) > Math.abs(info.offset.y) ? "x" : "y";
    if (locked.current !== "x") return;
    const atEdge = (index === 0 && info.offset.x > 0) || (index === count - 1 && info.offset.x < 0);
    drag.set(atEdge ? info.offset.x * EDGE_RESISTANCE : info.offset.x);
  };

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const horizontal = locked.current === "x";
    locked.current = null;
    if (!horizontal) return;
    const width = box.current?.offsetWidth ?? window.innerWidth;
    const far = Math.abs(info.offset.x) > width * SNAP_SHARE || Math.abs(info.velocity.x) > SNAP_VELOCITY;
    const next = far ? Math.min(count - 1, Math.max(0, index - Math.sign(info.offset.x))) : index;
    if (next !== index) {
      hapticFeedback("light");
      onIndexChange(next);
    } else {
      animate(drag, 0, reduced ? { duration: 0 } : SOFT_SPRING);
    }
  };

  return (
    <motion.div
      ref={box}
      className="relative overflow-hidden"
      animate={height === undefined ? undefined : { height }}
      transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex items-start will-change-transform"
        style={{ width: `${count * 100}%`, transform, touchAction: swipe ? "pan-y" : undefined }}
        onPan={swipe ? onPan : undefined}
        onPanEnd={swipe ? onPanEnd : undefined}
      >
        {panels.map((panel, i) => (
          <motion.div
            key={i}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className="shrink-0 px-1"
            style={{ width: `${100 / count}%` }}
            animate={{ opacity: i === index ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
            aria-hidden={i !== index}
            inert={i !== index}
          >
            {panel}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
