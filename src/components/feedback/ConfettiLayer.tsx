// Hört auf das Feier-Ereignis und zeichnet auf einem Canvas: braucht den Browser
"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { runConfetti } from "../../lib/feedback/confetti";
import { CELEBRATE_EVENT } from "../../lib/feedback/feedback";

/** Ebene über der ganzen App für kurzes Konfetti bei großen Momenten (Verkauf, Battle-Sieg, Level-Aufstieg). */
export interface ConfettiLayerProps { readonly _?: never; }

export default function ConfettiLayer() {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduce) return;
    const onCelebrate = () => setBurst((n) => n + 1);
    window.addEventListener(CELEBRATE_EVENT, onCelebrate);
    return () => window.removeEventListener(CELEBRATE_EVENT, onCelebrate);
  }, [reduce]);

  useEffect(() => {
    if (!burst || !canvas.current) return;
    return runConfetti(canvas.current, () => setBurst(0));
  }, [burst]);

  if (!burst) return null;
  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[80] h-full w-full" />;
}
