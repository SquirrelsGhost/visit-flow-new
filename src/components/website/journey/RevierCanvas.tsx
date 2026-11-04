// WebGL-Szene mit three.js: braucht den Browser
"use client";

import { useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createRevierEngine, type AnchorKey, type RevierEngine } from "../../../lib/website/revier/revierEngine";
import { siteFeedback, siteSound } from "../../../lib/website/websiteFeedback";

/**
 * Leinwand der Reise. Startet den 3D-Motor, reicht ihm den Scrollfortschritt weiter und
 * schiebt die schwebenden Beschriftungen an ihre Bildschirmposition (direkt im DOM, ohne Neu-Rendern).
 */
interface RevierCanvasProps {
  progress: MotionValue<number>;
  labels: RefObject<Partial<Record<AnchorKey, HTMLElement | null>>>;
}

const DOOR_SOUND_GAP_MS = 140;

export default function RevierCanvas({ progress, labels }: RevierCanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<RevierEngine | null>(null);
  const reduce = useReducedMotion() ?? false;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const lite = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    let lastSound = 0;
    try {
      engine.current = createRevierEngine(el, {
        lite,
        reduce,
        onFrame: (anchors) => {
          for (const [key, a] of Object.entries(anchors)) {
            const node = labels.current?.[key as AnchorKey];
            if (!node || !a) continue;
            node.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
            node.dataset.on = String(a.on);
          }
        },
        onDoors: (fresh) => {
          const now = performance.now();
          if (fresh.includes("sale")) siteFeedback("sale");
          else if (now - lastSound > DOOR_SOUND_GAP_MS) siteSound("tap");
          lastSound = now;
        },
      });
      engine.current.setProgress(progress.get());
    } catch {
      queueMicrotask(() => setFailed(true));
    }
    const observer = new IntersectionObserver(([entry]) => engine.current?.setActive(entry?.isIntersecting ?? true));
    observer.observe(el);
    return () => {
      observer.disconnect();
      engine.current?.dispose();
      engine.current = null;
    };
  }, [labels, progress, reduce]);

  useMotionValueEvent(progress, "change", (t) => engine.current?.setProgress(t));

  if (failed) return <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(220,38,38,0.25),transparent_70%)]" aria-hidden />;
  return <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />;
}
