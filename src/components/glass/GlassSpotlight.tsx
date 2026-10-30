// Folgt dem Mauszeiger über pointermove (nur im Browser)
"use client";

import { useEffect, useRef } from "react";

/**
 * Weicher Lichtkegel, der der Maus über der umgebenden Karte folgt. Auf Touch-Geräten bleibt er aus,
 * die Position läuft über CSS-Variablen ohne React-Neuzeichnen.
 */
export interface GlassSpotlightProps { readonly _?: never; }

export default function GlassSpotlight() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const spot = ref.current;
    const card = spot?.parentElement;
    if (!spot || !card) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = card.getBoundingClientRect();
      spot.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      spot.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      spot.style.opacity = "1";
    };
    const leave = () => (spot.style.opacity = "0");
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 [background:radial-gradient(420px_circle_at_var(--spot-x,50%)_var(--spot-y,0%),rgba(255,255,255,0.1),transparent_60%)]"
    />
  );
}
