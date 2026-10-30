import { useEffect, useRef, useState } from "react";

/** true für einen Moment, wenn `value` die Schwelle von unten überschreitet (v1: Konfetti ab 200 €). */
export function useCelebrate(value: number, threshold: number, durationMs = 1400): boolean {
  const previous = useRef(value);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const crossed = previous.current <= threshold && value > threshold;
    previous.current = value;
    if (!crossed) return;
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [value, threshold, durationMs]);
  return active;
}
