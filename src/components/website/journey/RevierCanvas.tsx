// WebGL-Szene mit three.js: braucht den Browser
"use client";

import { useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useWebsite } from "../../../hooks/website/useWebsite";
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
/** Ab diesem Anteil sichtbarer Leinwand verdeckt sie den Hintergrund ganz: der darf dann pausieren. */
const COVERED_RATIO = 0.98;
/** Etwas länger als die Ausblendung der Beschriftungen in website.css (0.45 s). */
const LABEL_FADE_MS = 520;

export default function RevierCanvas({ progress, labels }: RevierCanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<RevierEngine | null>(null);
  const reduce = useReducedMotion() ?? false;
  const { scroller } = useWebsite();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const lite = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    let lastSound = 0;
    // Letzter geschriebener Stand je Beschriftung: nur Änderungen ins DOM schreiben, ausgeblendete gar nicht bewegen
    const written: Partial<Record<AnchorKey, { x: number; y: number; on: boolean; offAt: number }>> = {};
    try {
      engine.current = createRevierEngine(el, {
        lite,
        reduce,
        onFrame: (anchors) => {
          const now = performance.now();
          for (const [key, a] of Object.entries(anchors) as [AnchorKey, { x: number; y: number; on: boolean } | undefined][]) {
            const node = labels.current?.[key];
            if (!node || !a) continue;
            const prev = written[key] ?? { x: NaN, y: NaN, on: false, offAt: -Infinity };
            if (prev.on !== a.on || !written[key]) node.dataset.on = String(a.on);
            if (prev.on && !a.on) prev.offAt = now;
            prev.on = a.on;
            written[key] = prev;
            // Ganz ausgeblendet (nach der Überblendung): nicht mehr bewegen, spart Stil- und Ebenenarbeit je Frame
            if (!a.on && now - prev.offAt > LABEL_FADE_MS && !Number.isNaN(prev.x)) continue;
            const x = Math.round(a.x * 2) / 2;
            const y = Math.round(a.y * 2) / 2;
            if (x === prev.x && y === prev.y) continue;
            prev.x = x;
            prev.y = y;
            node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
    const root = scroller.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        engine.current?.setActive(entry?.isIntersecting ?? true);
        // Solange die Szene den Bildschirm füllt, ist der Lichthintergrund dahinter unsichtbar und darf ruhen
        if (root) root.dataset.stage = entry && entry.intersectionRatio >= COVERED_RATIO ? "full" : "";
      },
      { threshold: [0, COVERED_RATIO] },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (root) root.dataset.stage = "";
      engine.current?.dispose();
      engine.current = null;
    };
  }, [labels, progress, reduce, scroller]);

  useMotionValueEvent(progress, "change", (t) => engine.current?.setProgress(t));

  if (failed) return <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(220,38,38,0.25),transparent_70%)]" aria-hidden />;
  return <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />;
}
