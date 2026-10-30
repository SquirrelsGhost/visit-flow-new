// Zählt die Zahl mit motion hoch, sobald sie sichtbar wird (nur im Browser)
"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSeenOnce } from "../../hooks/useSeenOnce";
import { cn } from "../../lib/cn";
import { splitGlassNumber, type GlassNumberKind } from "../../lib/glass/glassNumber";

interface GlassNumberProps {
  value: number;
  kind?: GlassNumberKind;
  /** Startwert beim ersten Erscheinen (Standard 0, also Hochzählen). */
  from?: number;
  /** Dauer in Sekunden. */
  duration?: number;
  className?: string;
  /** Klassen für den kleineren Nachsatz (Cent und Währung, Prozentzeichen). */
  restClassName?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Große Zahl wie in Banking-Apps: zählt beim ersten Sichtbarwerden weich hoch und läuft bei Änderungen
 * zum neuen Wert. Cent und Einheit stehen kleiner daneben. Ohne Bewegungswunsch steht sofort der Endwert.
 */
export default function GlassNumber({ value, kind = "int", from = 0, duration = 1.2, className, restClassName }: GlassNumberProps) {
  const root = useRef<HTMLSpanElement>(null);
  const main = useRef<HTMLSpanElement>(null);
  const rest = useRef<HTMLSpanElement>(null);
  const shown = useRef(from);
  const reduce = useReducedMotion();
  const inView = useSeenOnce(root);
  // Fester Anfangstext: React schreibt den Text danach nicht mehr, sonst blitzt der Endwert auf
  const [initial] = useState(() => splitGlassNumber(reduce ? value : from, kind));

  useEffect(() => {
    const write = (v: number) => {
      shown.current = v;
      const [a, b] = splitGlassNumber(v, kind);
      if (main.current) main.current.textContent = a;
      if (rest.current) rest.current.textContent = b;
    };
    if (reduce) return write(value);
    if (!inView) return;
    const controls = animate(shown.current, value, { duration, ease: EASE, onUpdate: write });
    return () => controls.stop();
  }, [value, kind, reduce, inView, duration]);

  return (
    <span ref={root} className={cn("inline-flex items-baseline whitespace-nowrap tabular-nums", className)}>
      <span ref={main}>{initial[0]}</span>
      <span ref={rest} className={cn("text-[0.55em] font-semibold opacity-70", restClassName)}>
        {initial[1]}
      </span>
    </span>
  );
}
