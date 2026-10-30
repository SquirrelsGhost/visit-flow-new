import { useCallback, useEffect, useRef, useState } from "react";
import { hapticFeedback } from "../lib/device/haptics";

export type CalcTab = "pencil" | "calc";
export const CALC_TABS: CalcTab[] = ["pencil", "calc"];

const EASE = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
const SKIP = 'input, button, select, textarea, [role="slider"], [data-no-swipe="true"]';

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const transitionFor = () => (prefersReducedMotion() ? "none" : EASE);

/**
 * Wischen zwischen "Tarif Vergleich" und "Rechner" (v1 useCalculatorSwipe): Während des Ziehens
 * wird nur das DOM bewegt (kein React-Render), am Rand federt es leicht, React erfährt nur das Ende.
 * Anders als v1 rechnet es mit der Breite des Containers statt mit vw, damit es auch neben einer Seitenleiste passt.
 */
export function useCalculatorSwipe() {
  const [activeTab, setActiveTab] = useState<CalcTab>("pencil");
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const index = useRef(0);

  const place = useCallback((offsetPx: number, transition: string) => {
    const slider = sliderRef.current;
    const width = containerRef.current?.clientWidth || 1;
    if (!slider) return;
    slider.style.transition = transition;
    slider.style.transform = `translate3d(${-index.current * 50 + (offsetPx / width) * 50}%, 0, 0)`;
  }, []);

  useEffect(() => {
    index.current = CALC_TABS.indexOf(activeTab);
    place(0, transitionFor());
  }, [activeTab, place]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const s = { startX: 0, startY: 0, startTime: 0, lastX: 0, tracking: false, swiping: false, raf: 0 };

    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || (e.target as HTMLElement | null)?.closest(SKIP)) return;
      Object.assign(s, { startX: touch.clientX, startY: touch.clientY, lastX: touch.clientX, startTime: Date.now() });
      s.tracking = true;
      s.swiping = false;
    };
    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!s.tracking || !touch) return;
      const dx = touch.clientX - s.startX;
      const dy = touch.clientY - s.startY;
      if (!s.swiping) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) return void (s.tracking = false);
        if (!(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8)) return;
        s.swiping = true;
      }
      e.preventDefault();
      const atEdge = (index.current === 0 && dx > 0) || (index.current === 1 && dx < 0);
      s.lastX = touch.clientX;
      cancelAnimationFrame(s.raf);
      s.raf = requestAnimationFrame(() => place(atEdge ? dx * 0.15 : dx, "none"));
    };
    const onEnd = () => {
      if (!s.tracking) return;
      cancelAnimationFrame(s.raf);
      const dx = s.lastX - s.startX;
      const velocity = dx / Math.max(Date.now() - s.startTime, 1);
      const far = Math.abs(dx) > container.clientWidth * 0.25;
      let next = index.current;
      if (s.swiping && (far || Math.abs(velocity) > 0.3)) next = dx > 0 ? Math.max(0, next - 1) : Math.min(1, next + 1);
      s.tracking = false;
      s.swiping = false;
      const target = CALC_TABS[next];
      if (next !== index.current && target) {
        hapticFeedback("light");
        setActiveTab(target);
      } else place(0, transitionFor());
    };

    container.addEventListener("touchstart", onStart, { passive: true });
    container.addEventListener("touchmove", onMove, { passive: false });
    container.addEventListener("touchend", onEnd, { passive: true });
    container.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onStart);
      container.removeEventListener("touchmove", onMove);
      container.removeEventListener("touchend", onEnd);
      container.removeEventListener("touchcancel", onEnd);
    };
  }, [place]);

  return { activeTab, setActiveTab, containerRef, sliderRef };
}
