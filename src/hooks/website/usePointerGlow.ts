import { useEffect, type RefObject } from "react";

/**
 * Schreibt die Zeigerposition als CSS-Variablen (--mx, --my in px, --px, --py von -1 bis 1) auf ein Element.
 * Nur mit Maus und ohne "Bewegung reduzieren"; ein Frame pro Bewegung.
 */
export function usePointerGlow(ref: RefObject<HTMLElement | null>, scope: "window" | "element" = "element") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = scope === "window" ? { left: 0, top: 0, width: innerWidth, height: innerHeight } : el.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.style.setProperty("--px", ((x / box.width) * 2 - 1).toFixed(3));
        el.style.setProperty("--py", ((y / box.height) * 2 - 1).toFixed(3));
      });
    };
    const target: Window | HTMLElement = scope === "window" ? window : el;
    target.addEventListener("pointermove", onMove as EventListener, { passive: true });
    return () => {
      target.removeEventListener("pointermove", onMove as EventListener);
      cancelAnimationFrame(frame);
    };
  }, [ref, scope]);
}
