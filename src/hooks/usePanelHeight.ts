import { useLayoutEffect, useState, type RefObject } from "react";

/** Höhe des aktiven Reiters, folgt ihm auch, wenn darin etwas auf- oder zuklappt. */
export function usePanelHeight(panels: RefObject<(HTMLDivElement | null)[]>, index: number): number | undefined {
  const [height, setHeight] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const panel = panels.current[index];
    // Ohne ResizeObserver (Tests, alte Browser) bleibt die Höhe automatisch
    if (!panel || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [panels, index]);
  return height;
}
