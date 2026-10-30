// Zählt Beträge mit motion weich hoch oder runter
"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { eur } from "../../lib/tariff/eur";

interface AnimatedEuroProps {
  value: number;
  suffix?: string;
  className?: string;
  /** Startwert beim ersten Anzeigen, z.B. 0 zum Hochzählen */
  from?: number;
  /** Dauer in Sekunden */
  duration?: number;
}

/** Euro-Betrag, der beim Ändern sanft zum neuen Wert läuft. Ohne Bewegung springt er direkt. */
export default function AnimatedEuro({ value, suffix = "", className, from, duration = 0.5 }: AnimatedEuroProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(from ?? value);
  // Fester Anfangstext: React überschreibt den Text sonst bei jedem Wert und es blitzt das Ziel auf
  const [initial] = useState(() => `${eur(from ?? value)}${suffix}`);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (v: number) => {
      shown.current = v;
      el.textContent = `${eur(v)}${suffix}`;
    };
    if (reduce) return write(value);
    const controls = animate(shown.current, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: write });
    return () => controls.stop();
  }, [value, suffix, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {initial}
    </span>
  );
}
