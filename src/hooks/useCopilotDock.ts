import { animate, useMotionValue, type PanInfo } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cornerAt, cornerPoint, readCorner, saveCorner, type CopilotCorner } from "../lib/copilot/copilotDock";
import { HOME_HREF } from "../lib/navigation/navItems";
import { SNAPPY_SPRING } from "../lib/motion/presets";

/** Topbar und Leiste gleiten beim Start herein; danach einmal neu messen. */
const SETTLE_MS = 700;

/**
 * Position des schwebenden Enes-Knopfs: liegt in einer Ecke, lässt sich frei ziehen und rastet
 * beim Loslassen mit Feder in der nächsten Ecke ein (v1 ai_widget_pos). Misst neu bei Größen- und Seitenwechsel.
 */
export function useCopilotDock() {
  const pathname = usePathname();
  const onMap = pathname === HOME_HREF;
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const [ready, setReady] = useState(false);

  const snap = useCallback(
    (target: CopilotCorner, instant = false) => {
      const point = cornerPoint(target, onMap);
      if (instant) {
        x.set(point.x);
        y.set(point.y);
        return;
      }
      animate(x, point.x, SNAPPY_SPRING);
      animate(y, point.y, SNAPPY_SPRING);
    },
    [onMap, x, y],
  );

  useEffect(() => {
    snap(readCorner(), true);
    // Erst nach dem Messen zeigen, sonst blitzt der Knopf links oben auf
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    const settle = window.setTimeout(() => snap(readCorner()), SETTLE_MS);
    const onResize = () => snap(readCorner(), true);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", onResize);
    };
  }, [snap]);

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const next = cornerAt(info.point.x, info.point.y, window.innerWidth, window.innerHeight);
      saveCorner(next);
      snap(next);
    },
    [snap],
  );

  return { x, y, ready, onDragEnd };
}
