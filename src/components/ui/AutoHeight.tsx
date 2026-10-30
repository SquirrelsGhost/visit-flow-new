// Misst die Höhe des Inhalts im Browser (ResizeObserver)
"use client";

import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Ruhige Kurve ohne Nachfedern: Die Karte gleitet auf und zu statt zu wippen. */
const RESIZE = { duration: 0.55, ease: [0.22, 1, 0.36, 1] } as const;

interface AutoHeightProps {
  children: ReactNode;
}

/** Folgt der Höhe seines Inhalts mit einer weichen Feder, statt hart auf- oder zuzuspringen. */
export default function AutoHeight({ children }: AutoHeightProps) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useLayoutEffect(() => {
    const element = inner.current;
    // Ohne ResizeObserver (alte Browser, Tests) bleibt die Höhe einfach "auto"
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div className="overflow-hidden" initial={false} animate={{ height }} transition={RESIZE}>
      <div ref={inner}>{children}</div>
    </motion.div>
  );
}
