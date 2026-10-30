// Zählt den Preis mit einer Feder im Browser hoch
"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatEuro } from "../../lib/onboarding/licenses";

interface AnimatedPriceProps {
  value: number;
}

/** Preis, der beim Wechsel von Paket oder Zahlweise weich zum neuen Betrag läuft. Bei reduzierter Bewegung springt er direkt. */
export default function AnimatedPrice({ value }: AnimatedPriceProps) {
  const element = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    if (reduce) {
      shown.current = value;
      node.textContent = formatEuro(value);
      return;
    }
    const controls = animate(shown.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        shown.current = latest;
        node.textContent = formatEuro(value % 1 === 0 ? Math.round(latest) : Math.round(latest * 100) / 100);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span ref={element} className="tabular-nums">
      {formatEuro(value)}
    </span>
  );
}
