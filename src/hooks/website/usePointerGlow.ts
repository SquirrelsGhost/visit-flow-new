import { useEffect, type RefObject } from "react";

/**
 * Lässt ein Licht-Element (zentrierte Scheibe, siehe .vfw-cursor) dem Zeiger im Fenster folgen.
 * Nur per transform auf diesem einen Element: keine CSS-Variablen auf dem Wurzelelement, die bei jeder
 * Mausbewegung die Stile der ganzen Seite neu berechnen ließen. Nur mit Maus und ohne "Bewegung reduzieren"; ein Frame pro Bewegung.
 */
export function usePointerGlow(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    // Größe einmal lesen: Layout-Abfragen je Mausbewegung vermeiden
    const half = el.offsetWidth / 2;
    let frame = 0;
    let x = 0;
    let y = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}
